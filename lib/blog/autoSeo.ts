import type { BlogDoc, BlogNode, TextNode } from "./nodes";
import type { Category, Tag } from "@/lib/blogApi";

function isTextNode(node: BlogNode): node is TextNode {
  return node.type === "text" && typeof (node as TextNode).text === "string";
}

/** Extracts plain text from a TipTap BlogDoc */
export function extractPlainTextFromDoc(doc?: BlogDoc | null): string {
  if (!doc || !Array.isArray(doc.content)) return "";
  const parts: string[] = [];

  function walk(node: BlogNode) {
    if (isTextNode(node)) {
      parts.push(node.text);
      return;
    }
    if ("content" in node && Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
    if (node.type === "paragraph" || node.type === "heading") {
      parts.push("\n");
    }
  }

  for (const node of doc.content) {
    walk(node);
  }

  return parts
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Common agricultural & aflatoxin keywords dictionary for auto-tagging */
const KEYWORD_TAXONOMY_MAP: Record<string, string[]> = {
  aflatoxin: ["Aflatoxin", "Sumukuvu", "Food Safety", "Crop Health"],
  sumukuvu: ["Sumukuvu", "Aflatoxin", "Usalama wa Chakula", "Afya ya Mazao"],
  maize: ["Maize", "Mahindi", "Cereals", "Grain Storage"],
  mahindi: ["Mahindi", "Maize", "Nafaka", "Hifadhi ya Mazao"],
  groundnut: ["Groundnuts", "Karanga", "Oilseeds", "Aflatoxin Prevention"],
  karanga: ["Karanga", "Groundnuts", "Mbegu za Mafuta", "Kuzuia Sumukuvu"],
  storage: ["Grain Storage", "Post-Harvest", "Hermetic Bags", "Storage Management"],
  hifadhi: ["Hifadhi ya Mazao", "Kuzuia Sumukuvu", "Mifuko ya Hermetic"],
  drying: ["Crop Drying", "Solar Drying", "Moisture Control", "Harvesting"],
  kukausha: ["Kukausha Mazao", "Unyevu", "Kuzuia Kuvu"],
  prevention: ["Prevention & Control", "Best Practices", "Farmer Guide"],
  kuzuia: ["Kuzuia Sumukuvu", "Mbinu Bora za Kilimo"],
  health: ["Health & Nutrition", "Food Safety", "Human Health"],
  afya: ["Afya na Lishe", "Usalama wa Chakula"],
  testing: ["Testing & Detection", "Rapid Test Kits", "Standards"],
  vipimo: ["Vipimo vya Sumukuvu", "Viwango vya Ubora"],
  cassava: ["Cassava", "Mihogo", "Root Crops"],
  mihogo: ["Mihogo", "Cassava", "Mizizi"],
  fungus: ["Fungus", "Mold", "Aspergillus Flavus"],
  kuvu: ["Kuvu", "Ukungu", "Aspergillus"],
  harvest: ["Harvesting", "Post-Harvest Management"],
  mavuno: ["Uvunaji", "Utunzaji wa Mazao"],
  livestock: ["Livestock & Poultry", "Animal Feed", "Mifugo"],
  mifugo: ["Chakula cha Mifugo", "Kuku na Ng'ombe"],
};

export interface AutoSeoResult {
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  matchedCategoryIds: string[];
  matchedTagIds: string[];
  suggestedTagNames: string[];
}

/**
 * Intelligent Auto SEO generator.
 * Works with both full content or initial topic/title before writing.
 */
export function generateAutoSeo({
  title,
  doc,
  categories = [],
  tags = [],
}: {
  title: string;
  doc?: BlogDoc | null;
  categories?: Category[];
  tags?: Tag[];
}): AutoSeoResult {
  const cleanTitle = title.trim();
  const rawBodyText = extractPlainTextFromDoc(doc);
  const combinedText = `${cleanTitle} ${rawBodyText}`.toLowerCase();

  // 1. Meta Title (Max ~60 chars)
  let metaTitle = cleanTitle;
  if (metaTitle.length > 0 && metaTitle.length <= 45 && !metaTitle.toLowerCase().includes("aflachat")) {
    metaTitle = `${metaTitle} | AflaChat`;
  }
  if (metaTitle.length > 65) {
    metaTitle = metaTitle.slice(0, 62).trim() + "…";
  }

  // 2. Excerpt & Meta Description
  let excerpt = "";
  let metaDescription = "";

  if (rawBodyText.length > 30) {
    // Extract first 1-2 sentences from prose
    const sentences = rawBodyText
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 15 && !s.includes("Photo by") && !s.includes("Image:"));

    if (sentences.length > 0) {
      excerpt = sentences.slice(0, 2).join(" ").trim();
      if (excerpt.length > 200) {
        excerpt = excerpt.slice(0, 197).trim() + "…";
      }
    }
  }

  if (!excerpt && cleanTitle) {
    // Generate starter synopsis from title
    const isSwahili =
      cleanTitle.toLowerCase().includes("sumukuvu") ||
      cleanTitle.toLowerCase().includes("mahindi") ||
      cleanTitle.toLowerCase().includes("jinsi ya") ||
      cleanTitle.toLowerCase().includes("kuhifadhi");

    if (isSwahili) {
      excerpt = `Mwongozo muhimu kuhusu ${cleanTitle.toLowerCase()} kwa wakulima, ukilenga kuzuia sumukuvu na kuongeza ubora wa mavuno.`;
    } else {
      excerpt = `Essential guide on ${cleanTitle.toLowerCase()} for farmers, focusing on aflatoxin prevention, food safety, and post-harvest management.`;
    }
  }

  // Meta description optimized for Google search results (130-155 characters)
  if (excerpt) {
    metaDescription = excerpt.length <= 155 ? excerpt : excerpt.slice(0, 152).trim() + "…";
  } else if (cleanTitle) {
    metaDescription = `Learn about ${cleanTitle} with practical tips and expert agricultural guidance from AflaChat.`;
  }

  // 3. Match Tags and Categories
  const matchedCategoryIds: string[] = [];
  const matchedTagIds: string[] = [];
  const suggestedTagNames: string[] = [];

  // Match existing categories
  categories.forEach((cat) => {
    const catWords = cat.name.toLowerCase().split(/\s+/);
    if (
      combinedText.includes(cat.name.toLowerCase()) ||
      catWords.some((w) => w.length > 3 && combinedText.includes(w))
    ) {
      matchedCategoryIds.push(cat.id);
    }
  });

  // Match existing tags
  tags.forEach((tag) => {
    const tagLower = tag.name.toLowerCase();
    if (combinedText.includes(tagLower)) {
      matchedTagIds.push(tag.id);
    }
  });

  // Keyword dictionary expansion
  for (const [key, relatedList] of Object.entries(KEYWORD_TAXONOMY_MAP)) {
    if (combinedText.includes(key)) {
      for (const item of relatedList) {
        // Find in tags
        const existingTag = tags.find((t) => t.name.toLowerCase() === item.toLowerCase());
        if (existingTag && !matchedTagIds.includes(existingTag.id)) {
          matchedTagIds.push(existingTag.id);
        } else if (!existingTag && !suggestedTagNames.includes(item)) {
          suggestedTagNames.push(item);
        }

        // Find in categories
        const existingCat = categories.find((c) => c.name.toLowerCase() === item.toLowerCase());
        if (existingCat && !matchedCategoryIds.includes(existingCat.id)) {
          matchedCategoryIds.push(existingCat.id);
        }
      }
    }
  }

  return {
    metaTitle,
    metaDescription,
    excerpt,
    matchedCategoryIds,
    matchedTagIds,
    suggestedTagNames: suggestedTagNames.slice(0, 6),
  };
}
