import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

import type { AgentDefinition } from "@/src/types/agents";

export type SkillInstallSourceKind = "git" | "local";

export type DiscoveredInstallSkill = {
  name: string;
  sourcePath: string;
  skillFilePath: string;
};

export type SkillInstallCompleted = {
  skillName: string;
  agentId: string;
  agentName: string;
  targetPath: string;
};

export type SkillInstallSkipped = SkillInstallCompleted & {
  reason: string;
};

export type SkillInstallFailed = SkillInstallCompleted & {
  error: string;
};

export type SkillInstallResult = {
  source: string;
  sourceKind: SkillInstallSourceKind;
  discovered: DiscoveredInstallSkill[];
  completed: SkillInstallCompleted[];
  skipped: SkillInstallSkipped[];
  failed: SkillInstallFailed[];
};

type PreparedSource = {
  kind: SkillInstallSourceKind;
  path: string;
  cleanupPath: string | null;
};

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "http_proxy",
  "https_proxy",
  "all_proxy"
] as const;
const GIT_CLONE_TIMEOUT_MS = 180_000;

function normalizeSource(input: string): string {
  return input.trim();
}

export function classifySkillInstallSource(source: string): SkillInstallSourceKind {
  if (
    /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+(?:\.git)?(?:\/)?$/i.test(source) ||
    /^git@github\.com:[^/\s]+\/[^/\s]+(?:\.git)?$/i.test(source)
  ) {
    return "git";
  }

  return "local";
}

function expandLocalPath(source: string): string {
  if (source === "~") {
    return homedir();
  }

  if (source.startsWith("~/")) {
    return join(homedir(), source.slice(2));
  }

  return resolve(source);
}

function gitSourceDirectoryName(source: string): string {
  const withoutSuffix = source.replace(/\/$/, "").replace(/\.git$/, "");
  const name = withoutSuffix.split(/[/:]/).at(-1)?.trim();

  if (!name) {
    throw new Error("无法从 GitHub 地址识别仓库名称。");
  }

  return name;
}

export function buildGitCloneEnv(options: { disableProxy?: boolean } = {}) {
  if (!options.disableProxy) {
    return process.env;
  }

  const env = { ...process.env };
  for (const key of PROXY_ENV_KEYS) {
    delete env[key];
  }

  env.NO_PROXY = env.NO_PROXY ? `${env.NO_PROXY},github.com` : "github.com";
  env.no_proxy = env.no_proxy ? `${env.no_proxy},github.com` : "github.com";

  return env;
}

export function buildGitCloneArgs(
  source: string,
  targetPath: string,
  options: { httpVersion?: "HTTP/1.1" } = {}
) {
  const args = ["clone", "--depth", "1", source, targetPath];
  if (options.httpVersion) {
    return ["-c", `http.version=${options.httpVersion}`, ...args];
  }

  return args;
}

function isProxyCloneError(error: Error): boolean {
  return /CONNECT tunnel failed|response 501|proxy|Proxy/i.test(error.message);
}

function isHttp2CloneError(error: Error): boolean {
  return /HTTP2 framing layer|HTTP\/2|http2/i.test(error.message);
}

function runGitCloneOnce(
  source: string,
  targetPath: string,
  options: { disableProxy?: boolean; httpVersion?: "HTTP/1.1" } = {}
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("git", buildGitCloneArgs(source, targetPath, options), {
      env: buildGitCloneEnv(options),
      stdio: ["ignore", "pipe", "pipe"]
    });
    const stderr: Buffer[] = [];
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      child.kill("SIGTERM");
    }, GIT_CLONE_TIMEOUT_MS);

    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (didTimeout) {
        reject(new Error("git clone 超时，请检查网络或稍后重试。"));
        return;
      }

      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(
        new Error(
          Buffer.concat(stderr).toString("utf8").trim() ||
            `git clone failed with exit code ${code ?? "unknown"}`
        )
      );
    });
  });
}

async function runGitClone(source: string, targetPath: string): Promise<void> {
  const attempts: Array<{
    disableProxy?: boolean;
    httpVersion?: "HTTP/1.1";
    shouldRun: (error: Error) => boolean;
  }> = [
    {
      disableProxy: true,
      shouldRun: (error) => isProxyCloneError(error) || isHttp2CloneError(error)
    },
    {
      disableProxy: true,
      httpVersion: "HTTP/1.1",
      shouldRun: (error) => isProxyCloneError(error) || isHttp2CloneError(error)
    }
  ];

  try {
    await runGitCloneOnce(source, targetPath);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    let lastError = error;
    for (const attempt of attempts) {
      if (!attempt.shouldRun(lastError)) {
        continue;
      }

      try {
        await rm(targetPath, { recursive: true, force: true });
        await runGitCloneOnce(source, targetPath, attempt);
        return;
      } catch (nextError) {
        if (nextError instanceof Error) {
          lastError = nextError;
          continue;
        }
        throw nextError;
      }
    }

    throw lastError;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function assertDirectory(path: string) {
  try {
    const value = await stat(path);
    if (!value.isDirectory()) {
      throw new Error(`Source is not a directory: ${path}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Source is not")) {
      throw error;
    }
    throw new Error(`Source directory does not exist: ${path}`);
  }
}

async function prepareSource(source: string): Promise<PreparedSource> {
  const kind = classifySkillInstallSource(source);

  if (kind === "local") {
    const localPath = expandLocalPath(source);
    await assertDirectory(localPath);
    return { kind, path: localPath, cleanupPath: null };
  }

  const tempRoot = await mkdtemp(join(tmpdir(), "skills-hub-install-"));
  const clonePath = join(tempRoot, gitSourceDirectoryName(source));
  try {
    await runGitClone(source, clonePath);
    return { kind, path: clonePath, cleanupPath: tempRoot };
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

export async function discoverInstallableSkills(
  sourcePath: string
): Promise<DiscoveredInstallSkill[]> {
  if (await pathExists(join(sourcePath, "SKILL.md"))) {
    return [
      {
        name: basename(sourcePath),
        sourcePath,
        skillFilePath: join(sourcePath, "SKILL.md")
      }
    ];
  }

  const entries = await readdir(sourcePath, { withFileTypes: true });
  const skills = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry): Promise<DiscoveredInstallSkill | null> => {
        const skillPath = join(sourcePath, entry.name);
        const skillFilePath = join(skillPath, "SKILL.md");
        if (!(await pathExists(skillFilePath))) {
          return null;
        }
        return {
          name: entry.name,
          sourcePath: skillPath,
          skillFilePath
        };
      })
  );

  return skills.filter((skill): skill is DiscoveredInstallSkill => skill !== null);
}

export async function installSkillSource(
  rawSource: string,
  agents: AgentDefinition[]
): Promise<SkillInstallResult> {
  const source = normalizeSource(rawSource);
  if (!source) {
    throw new Error("请输入 GitHub skill 项目地址或本地目录。");
  }

  const prepared = await prepareSource(source);
  const result: SkillInstallResult = {
    source,
    sourceKind: prepared.kind,
    discovered: [],
    completed: [],
    skipped: [],
    failed: []
  };

  try {
    const discovered = await discoverInstallableSkills(prepared.path);
    result.discovered = discovered;

    if (discovered.length === 0) {
      throw new Error("没有找到包含 SKILL.md 的 skill 目录。");
    }

    for (const skill of discovered) {
      for (const agent of agents) {
        const targetPath = join(agent.skillsPath, skill.name);
        const base = {
          skillName: skill.name,
          agentId: agent.id,
          agentName: agent.name,
          targetPath
        };

        try {
          if (await pathExists(targetPath)) {
            result.skipped.push({
              ...base,
              reason: "目标目录已存在，未覆盖。"
            });
            continue;
          }

          await mkdir(agent.skillsPath, { recursive: true });
          await cp(skill.sourcePath, targetPath, { recursive: true });
          result.completed.push(base);
        } catch (error) {
          result.failed.push({
            ...base,
            error: error instanceof Error ? error.message : "Unknown install error"
          });
        }
      }
    }

    return result;
  } finally {
    if (prepared.cleanupPath) {
      await rm(prepared.cleanupPath, { recursive: true, force: true });
    }
  }
}
