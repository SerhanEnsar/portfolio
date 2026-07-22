// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

import { projects, getProject } from "@/content/projects";
import { profile } from "@/content/site";
import { locales, type Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";
import { reset as resetProgress } from "@/lib/progress";

/**
 * Console command registry. Everything reads from the same content modules the
 * page renders from, so there is no second copy of the project list to drift.
 */

export type CommandContext = {
  locale: Locale;
  dict: Dictionary;
  navigate: (href: string) => void;
  clear: () => void;
};

export type CommandOutput = {
  lines: string[];
  tone?: "normal" | "error";
};

export type Command = {
  name: string;
  args?: string;
  summary: Record<Locale, string>;
  run: (args: string[], ctx: CommandContext) => CommandOutput | void;
};

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);

export const commands: Command[] = [
  {
    name: "help",
    summary: { en: "list commands", tr: "komutları listele" },
    run: (_args, { dict, locale }) => ({
      lines: [
        dict.console.help,
        ...commands.map(
          (c) =>
            `  ${(c.args ? `${c.name} ${c.args}` : c.name).padEnd(18)}${c.summary[locale]}`,
        ),
      ],
    }),
  },
  {
    name: "ls",
    summary: { en: "list projects", tr: "projeleri listele" },
    run: (_args, { locale }) => ({
      lines: projects.map(
        (p) =>
          `  ${p.slug.padEnd(14)}${p.codename.padEnd(12)}${p.status === "active" ? "active  " : "complete"}  ${p.title[locale]}`,
      ),
    }),
  },
  {
    name: "cat",
    args: "<project>",
    summary: { en: "read a project brief", tr: "proje künyesini oku" },
    run: (args, { locale, dict }) => {
      const slug = args[0];
      const project = slug ? getProject(slug) : undefined;
      if (!project) {
        return {
          tone: "error",
          lines: [fill(dict.console.noSuchProject, { slug: slug ?? "" })],
        };
      }
      return {
        lines: [
          `${project.codename} — ${project.title[locale]}`,
          `${project.years} · ${project.role[locale]} · ${project.program[locale]}`,
          "",
          project.headline[locale],
          "",
          project.summary[locale],
        ],
      };
    },
  },
  {
    name: "open",
    args: "<page>",
    summary: { en: "go to lab, sim, cv or a project", tr: "lab, sim, cv veya bir projeye git" },
    run: (args, { locale, navigate, dict }) => {
      const target = args[0];
      if (!target) return { tone: "error", lines: [fill(dict.console.unknown, { cmd: "open" })] };

      if (target === "lab" || target === "sim") {
        navigate(`/${locale}/${target}`);
        return;
      }
      if (target === "cv") {
        navigate(profile.cvPath);
        return;
      }
      if (getProject(target)) {
        navigate(`/${locale}/projects/${target}`);
        return;
      }
      return { tone: "error", lines: [fill(dict.console.noSuchProject, { slug: target })] };
    },
  },
  {
    name: "lang",
    args: "<en|tr>",
    summary: { en: "switch language", tr: "dili değiştir" },
    run: (args, { locale, navigate, dict }) => {
      const next = args[0] as Locale;
      if (!locales.includes(next)) {
        return { tone: "error", lines: [fill(dict.console.unknown, { cmd: `lang ${args[0] ?? ""}` })] };
      }
      if (next === locale) return { lines: [dict.console.switched] };
      navigate(
        `/${next}${window.location.pathname.replace(new RegExp(`^/${locale}`), "")}`,
      );
    },
  },
  {
    name: "whoami",
    summary: { en: "who runs this", tr: "bu siteyi kim yürütüyor" },
    run: (_args, { locale }) => ({
      lines: [
        profile.name,
        profile.university[locale],
        profile.discipline[locale],
        profile.email,
      ],
    }),
  },
  {
    name: "reset",
    summary: { en: "clear mission progress", tr: "görev ilerlemesini sıfırla" },
    run: (_args, { dict }) => {
      resetProgress();
      return { lines: [dict.hud.reset] };
    },
  },
  {
    name: "clear",
    summary: { en: "clear the console", tr: "konsolu temizle" },
    run: (_args, { clear }) => {
      clear();
    },
  },
];

export function runCommand(input: string, ctx: CommandContext): CommandOutput | void {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return;

  const command = commands.find((c) => c.name === name);
  if (!command) {
    return { tone: "error", lines: [fill(ctx.dict.console.unknown, { cmd: name })] };
  }
  return command.run(args, ctx);
}
