import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type PreviousSnapshot = Record<string, { digest?: string; lastUpdated?: string }>;

const GOOGLE_SEO_DOCS = [
  {
    id: "seo-starter-guide",
    title: "SEO Starter Guide",
    url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en",
    focus: "baseline geral de SEO tecnico e conteudo",
  },
  {
    id: "helpful-content",
    title: "Creating helpful, reliable, people-first content",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=en",
    focus: "qualidade de conteudo e sinais de utilidade",
  },
  {
    id: "title-links",
    title: "Control your title links in search results",
    url: "https://developers.google.com/search/docs/appearance/title-link?hl=en",
    focus: "titulos e CTR",
  },
  {
    id: "snippets",
    title: "Control your snippets in search results",
    url: "https://developers.google.com/search/docs/appearance/snippet?hl=en",
    focus: "meta description e snippet control",
  },
  {
    id: "structured-data",
    title: "Intro to structured data markup in Search",
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=en",
    focus: "dados estruturados e rich results",
  },
  {
    id: "google-images",
    title: "Google Images best practices",
    url: "https://developers.google.com/search/docs/appearance/google-images?hl=en#best-practices",
    focus: "SEO de imagens e acessibilidade",
  },
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function cleanText(value: string) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripHtml(value: string) {
  return cleanText(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function extractMetaDescription(html: string) {
  const direct = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)?.[1];
  return cleanText(direct ?? "");
}

function extractLastUpdated(html: string) {
  const direct = stripHtml(html).match(/Last updated\s+([A-Za-z0-9,\- ]+?)\s+UTC/i)?.[1];
  return cleanText(direct ?? "");
}

function digestDocument(html: string) {
  const normalized = stripHtml(html).toLowerCase();
  return crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 16);
}

function buildPrompt(input: {
  checkedAt: string;
  changedCount: number;
  docs: Array<{
    id: string;
    title: string;
    url: string;
    focus: string;
    lastUpdated: string;
    status: string;
    note: string;
  }>;
}) {
  const changedDocs = input.docs.filter((doc) => doc.status === "updated" || doc.status === "new");
  const relevantDocs = changedDocs.length ? changedDocs : input.docs;

  return [
    "Atue como principal engineer de SEO e mantenedor do motor SitePulse.",
    "Use exclusivamente a documentacao oficial do Google Search Central listada abaixo.",
    "Objetivo: atualizar as regras, checklist, heuristicas e prompts de SEO do SitePulse sem fix cosmetico.",
    `Checagem executada em: ${input.checkedAt}`,
    `Mudancas detectadas desde o snapshot anterior: ${input.changedCount}`,
    "",
    "Documentos oficiais revisados agora:",
    ...input.docs.map(
      (doc, index) =>
        `${index + 1}. ${doc.title} | status=${doc.status} | lastUpdated=${doc.lastUpdated || "n/d"} | foco=${doc.focus} | url=${doc.url}`,
    ),
    "",
    changedDocs.length
      ? "Priorize primeiro os documentos marcados como new/updated."
      : "Nenhuma mudanca nova detectada; valide alinhamento do SitePulse com o baseline atual.",
    "",
    "Tarefas obrigatorias:",
    "1. Comparar as regras atuais de SEO do SitePulse com as praticas oficiais acima.",
    "2. Identificar regras novas, regras alteradas, regras obsoletas e ajustes de peso/prioridade.",
    "3. Atualizar checklist, score, mensagens para leigo, relatorio tecnico e prompt SEO.",
    "4. Manter rastreabilidade: para cada ajuste, citar qual doc oficial motivou a mudanca.",
    "5. Entregar diff objetivo: o que mudou, por que mudou, como validar.",
    "",
    "Formato de entrega:",
    "- resumo executivo",
    "- tabela de mudancas por regra",
    "- arquivos a editar",
    "- codigo sugerido",
    "- plano de validacao",
    "",
    "Foco imediato desta rodada:",
    ...relevantDocs.map((doc, index) => `${index + 1}. ${doc.title} | ${doc.focus} | ${doc.url}`),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const previousSnapshot: PreviousSnapshot =
    body?.previousSnapshot && typeof body.previousSnapshot === "object"
      ? (body.previousSnapshot as PreviousSnapshot)
      : {};

  const checkedAt = new Date().toISOString();
  const docs = await Promise.all(
    GOOGLE_SEO_DOCS.map(async (doc) => {
      try {
        const res = await fetch(doc.url, {
          cache: "no-store",
          headers: {
            "user-agent": "SitePulse-SEO-Watch/1.0",
          },
        });
        if (!res.ok) {
          return {
            ...doc,
            lastUpdated: "",
            digest: "",
            status: "error" as const,
            note: `HTTP ${res.status}`,
          };
        }
        const html = await res.text();
        const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? doc.title);
        const description = extractMetaDescription(html);
        const lastUpdated = extractLastUpdated(html);
        const digest = digestDocument(html);
        const previous = previousSnapshot[doc.id];
        const status =
          !previous?.digest && !previous?.lastUpdated
            ? "new"
            : previous.digest !== digest || previous.lastUpdated !== lastUpdated
            ? "updated"
            : "unchanged";

        return {
          ...doc,
          title: title || doc.title,
          lastUpdated,
          digest,
          status: status as "new" | "updated" | "unchanged",
          note: description || doc.focus,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "fetch_failed";
        return {
          ...doc,
          lastUpdated: "",
          digest: "",
          status: "error" as const,
          note: message,
        };
      }
    }),
  );

  const changedCount = docs.filter((doc) => doc.status === "new" || doc.status === "updated").length;
  const prompt = buildPrompt({ checkedAt, changedCount, docs });

  return NextResponse.json({
    ok: true,
    checkedAt,
    changedCount,
    docs,
    prompt,
    sources: docs.map((doc) => doc.url),
  });
}
