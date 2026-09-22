"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.A4_LANDSCAPE_HEIGHT_TWIPS = exports.A4_LANDSCAPE_WIDTH_TWIPS = exports.DIARY_DOCUMENT_COPIES = void 0;
exports.formatDiaryIssuedDatePt = formatDiaryIssuedDatePt;
exports.escapeXml = escapeXml;
exports.extractWordText = extractWordText;
exports.countPageBreaks = countPageBreaks;
exports.applyA4LandscapeSectPr = applyA4LandscapeSectPr;
exports.replacePrimeHeaderWithLogo = replacePrimeHeaderWithLogo;
exports.applySection2FontSize = applySection2FontSize;
exports.prepareDiaryTemplateXml = prepareDiaryTemplateXml;
exports.fillDiaryCopyXml = fillDiaryCopyXml;
exports.duplicateDiaryBodyXml = duplicateDiaryBodyXml;
exports.resolvePrimeLogoPath = resolvePrimeLogoPath;
exports.resolveDiaryTemplatePath = resolveDiaryTemplatePath;
exports.diaryDocumentFileName = diaryDocumentFileName;
exports.buildFreelivingDiaryDocument = buildFreelivingDiaryDocument;
exports.createMinimalDiaryTemplate = createMinimalDiaryTemplate;
var fs_1 = require("fs");
var path_1 = require("path");
var JSZip = require("jszip");
exports.DIARY_DOCUMENT_COPIES = 7;
/** A4 paisagem em twips (297 mm × 210 mm). O formulário oficial cabe em uma folha. */
exports.A4_LANDSCAPE_WIDTH_TWIPS = '16838';
exports.A4_LANDSCAPE_HEIGHT_TWIPS = '11906';
var DOCUMENT_XML_PATH = 'word/document.xml';
var DOCUMENT_RELS_PATH = 'word/_rels/document.xml.rels';
var CONTENT_TYPES_PATH = '[Content_Types].xml';
var TEMPLATE_FILE_NAME = 'diario_prime_free_living.docx';
var LOGO_FILE_NAME = 'logoprimeCompleto.png';
var LOGO_REL_ID = 'rIdLogoPrime';
var LOGO_MEDIA_PATH = "word/media/".concat(LOGO_FILE_NAME);
var TWIPS_TO_EMU = 635;
var LOGO_PX_WIDTH = 558;
var LOGO_PX_HEIGHT = 227;
/** ~1,4 cm de altura no cabeçalho, para o dia inteiro caber em uma folha A4. */
var LOGO_HEIGHT_TWIPS = 800;
var LOGO_WIDTH_TWIPS = Math.round((LOGO_HEIGHT_TWIPS * LOGO_PX_WIDTH) / LOGO_PX_HEIGHT);
var LOGO_CX_EMU = String(LOGO_WIDTH_TWIPS * TWIPS_TO_EMU);
var LOGO_CY_EMU = String(LOGO_HEIGHT_TWIPS * TWIPS_TO_EMU);
var PLACEHOLDERS = {
    dia: '{{DIA}}',
    nome: '{{NOME}}',
    identificador: '{{IDENTIFICADOR}}',
    data: '{{DATA}}',
    cpf: '{{CPF}}',
    m1: '{{M1}}',
    m2: '{{M2}}',
    m3: '{{M3}}',
    m4: '{{M4}}',
    m5: '{{M5}}',
};
var MEDICATION_PLACEHOLDERS = [
    PLACEHOLDERS.m1,
    PLACEHOLDERS.m2,
    PLACEHOLDERS.m3,
    PLACEHOLDERS.m4,
    PLACEHOLDERS.m5,
];
var A4_LANDSCAPE_PGSZ = "<w:pgSz w:w=\"".concat(exports.A4_LANDSCAPE_WIDTH_TWIPS, "\" w:h=\"").concat(exports.A4_LANDSCAPE_HEIGHT_TWIPS, "\" w:orient=\"landscape\"/>");
/** Laterais ~1 cm; topo/base mais curtos para a seção 4 não ir para a página seguinte. */
var A4_LANDSCAPE_PGMAR = '<w:pgMar w:top="240" w:right="567" w:bottom="80" w:left="567" w:header="0" w:footer="0" w:gutter="0"/>';
function formatDiaryIssuedDatePt(now) {
    if (now === void 0) { now = new Date(); }
    return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(now);
}
function escapeXml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function extractWordText(xml) {
    var texts = [];
    var re = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
    var match;
    while ((match = re.exec(xml))) {
        texts.push(match[1]);
    }
    return texts.join('');
}
function countPageBreaks(xml) {
    var explicitBreaks = (xml.match(/<w:br\b[^>]*w:type="page"/g) || []).length;
    var sectionBreaks = (xml.match(/w:val="nextPage"/g) || []).length;
    return explicitBreaks + sectionBreaks;
}
function applyA4LandscapeSectPr(sectPr) {
    var next = sectPr.trim() || '<w:sectPr></w:sectPr>';
    if (/<w:pgSz\b/.test(next)) {
        next = next.replace(/<w:pgSz\b[^>]*\/>/g, A4_LANDSCAPE_PGSZ);
        next = next.replace(/<w:pgSz\b[^>]*>[\s\S]*?<\/w:pgSz>/g, A4_LANDSCAPE_PGSZ);
    }
    else {
        next = next.replace(/<w:sectPr\b([^>]*)>/, "<w:sectPr$1>".concat(A4_LANDSCAPE_PGSZ));
    }
    if (/<w:pgMar\b/.test(next)) {
        next = next.replace(/<w:pgMar\b[^>]*\/>/g, A4_LANDSCAPE_PGMAR);
        next = next.replace(/<w:pgMar\b[^>]*>[\s\S]*?<\/w:pgMar>/g, A4_LANDSCAPE_PGMAR);
    }
    else {
        next = next.replace(A4_LANDSCAPE_PGSZ, "".concat(A4_LANDSCAPE_PGSZ).concat(A4_LANDSCAPE_PGMAR));
    }
    return next;
}
function withNextPageSectionType(sectPr) {
    var next = applyA4LandscapeSectPr(sectPr);
    if (/<w:type\b/.test(next)) {
        next = next.replace(/<w:type\b[^>]*\/>/g, '<w:type w:val="nextPage"/>');
        next = next.replace(/<w:type\b[^>]*>[\s\S]*?<\/w:type>/g, '<w:type w:val="nextPage"/>');
    }
    else {
        next = next.replace(/<w:sectPr\b([^>]*)>/, "<w:sectPr$1><w:type w:val=\"nextPage\"/>");
    }
    return next;
}
function sectionBreakParagraph(sectPr) {
    return "<w:p><w:pPr>".concat(withNextPageSectionType(sectPr), "</w:pPr></w:p>");
}
function insertPlaceholderOnce(xml, placeholder, labelRe, insertAfter) {
    if (xml.includes(placeholder))
        return xml;
    return xml.replace(labelRe, function (full, open, inner, close) {
        if (inner.includes(placeholder))
            return full;
        var patched = insertAfter
            ? inner.replace(insertAfter, function (token) { return "".concat(token, " ").concat(placeholder); })
            : "".concat(inner, " ").concat(placeholder);
        if (patched === inner) {
            return "".concat(open).concat(inner, " ").concat(placeholder).concat(close);
        }
        return "".concat(open).concat(patched).concat(close);
    });
}
function insertAfterFirstWt(xml, snippet) {
    return xml.replace(/(<w:t\b[^>]*>)([^<]*)(<\/w:t>)/, function (_full, open, inner, close) {
        return "".concat(open).concat(inner).concat(snippet).concat(close);
    });
}
function unfloatTables(xml) {
    return xml
        .replace(/<w:tblpPr\b[^/]*\/>/g, '')
        .replace(/<w:tblpPr\b[^>]*>[\s\S]*?<\/w:tblpPr>/g, '')
        .replace(/<w:tblOverlap\b[^/]*\/>/g, '')
        .replace(/<w:tblOverlap\b[^>]*>[\s\S]*?<\/w:tblOverlap>/g, '');
}
/** Encaixa identificação, medicação e atividades na área útil do A4 paisagem. */
function fitOfficialLayoutToA4(xml) {
    var next = xml.replace(/<w:tblInd w:w="-3501" w:type="dxa"\/>/g, '<w:tblInd w:w="0" w:type="dxa"/>');
    next = next.replace(/<w:ind w:left="3495"\/>/g, '<w:ind w:left="120"/>');
    next = next.replace(/<w:ind w:left="3637"\/>/g, '<w:ind w:left="120"/>');
    next = next.replace(/<w:tblLayout w:type="fixed"\/>/g, '<w:tblLayout w:type="autofit"/>');
    next = next.replace(/<w:tblW w:w="0" w:type="auto"\/>/g, '<w:tblW w:w="5000" w:type="pct"/>');
    var usableWidth = 16838 - 567 - 567;
    var originalMainWidth = 19513;
    var factor = usableWidth / originalMainWidth;
    var widthsToScale = [
        10305, 9083, 8076, 5314, 5191, 4267, 4182, 3894, 3847, 2417, 2276, 2127,
    ];
    for (var _i = 0, widthsToScale_1 = widthsToScale; _i < widthsToScale_1.length; _i++) {
        var width = widthsToScale_1[_i];
        var scaled = Math.max(240, Math.round(width * factor));
        next = next.split("w:w=\"".concat(width, "\"")).join("w:w=\"".concat(scaled, "\""));
    }
    return next;
}
/** Compacta o ritmo vertical para um dia = uma página A4 paisagem. */
function compactDiaryVerticalRhythm(xml) {
    var next = xml.replace(/w:line="240"/g, 'w:line="200"');
    next = next.replace(/<w:trHeight w:val="331"\/>/g, '<w:trHeight w:val="250"/>');
    next = next.replace(/<w:trHeight w:val="288"\/>/g, '<w:trHeight w:val="220"/>');
    return next;
}
function keepSection4WithTable(xml) {
    var marker = xml.indexOf('xml:space="preserve">4. </w:t>');
    if (marker < 0)
        return xml;
    var pStart = lastParagraphStart(xml, marker);
    if (pStart < 0)
        return xml;
    var pPrClose = xml.indexOf('</w:pPr>', pStart);
    if (pPrClose < 0 || pPrClose > marker)
        return xml;
    var head = xml.slice(pStart, pPrClose);
    if (head.includes('keepNext'))
        return xml;
    return "".concat(xml.slice(0, pPrClose), "<w:keepNext/>").concat(xml.slice(pPrClose));
}
function occupyLogoReservedSpace(xml) {
    return xml.replace(/<w:trPr>\s*<w:gridBefore w:val="1"\/>\s*<w:wBefore w:w="(\d+)" w:type="dxa"\/>\s*<\/w:trPr>\s*<w:tc>\s*<w:tcPr>\s*<w:tcW w:w="(\d+)" w:type="dxa"\/>/, function (_full, before, cell) {
        var width = Number(before) + Number(cell);
        return ("<w:trPr></w:trPr><w:tc><w:tcPr><w:gridSpan w:val=\"2\"/>" +
            "<w:tcW w:w=\"".concat(width, "\" w:type=\"dxa\"/>"));
    });
}
function logoDrawingXml(relId) {
    return ("<w:drawing><wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">" +
        "<wp:extent cx=\"".concat(LOGO_CX_EMU, "\" cy=\"").concat(LOGO_CY_EMU, "\"/>") +
        "<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>" +
        "<wp:docPr id=\"90\" name=\"Logo PRIME\"/>" +
        "<wp:cNvGraphicFramePr>" +
        "<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>" +
        "</wp:cNvGraphicFramePr>" +
        "<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">" +
        "<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">" +
        "<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">" +
        "<pic:nvPicPr>" +
        "<pic:cNvPr id=\"0\" name=\"".concat(LOGO_FILE_NAME, "\"/>") +
        "<pic:cNvPicPr><pic:picLocks noChangeAspect=\"1\"/></pic:cNvPicPr>" +
        "</pic:nvPicPr>" +
        "<pic:blipFill>" +
        "<a:blip r:embed=\"".concat(relId, "\"/>") +
        "<a:stretch><a:fillRect/></a:stretch>" +
        "</pic:blipFill>" +
        "<pic:spPr>" +
        "<a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"".concat(LOGO_CX_EMU, "\" cy=\"").concat(LOGO_CY_EMU, "\"/></a:xfrm>") +
        "<a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom>" +
        "</pic:spPr>" +
        "</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>");
}
function replacePrimeHeaderWithLogo(xml, relId) {
    var _a;
    if (relId === void 0) { relId = LOGO_REL_ID; }
    var marker = '<w:t>PRIME</w:t>';
    var markerAt = xml.indexOf(marker);
    if (markerAt < 0)
        return xml;
    var pStartAttr = xml.lastIndexOf('<w:p ', markerAt);
    var pStartBare = xml.lastIndexOf('<w:p>', markerAt);
    var pStart = Math.max(pStartAttr, pStartBare);
    var pEnd = xml.indexOf('</w:p>', markerAt);
    if (pStart < 0 || pEnd < 0)
        return xml;
    var paragraph = xml.slice(pStart, pEnd + 6);
    var pPrMatch = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    var pPr = (_a = pPrMatch === null || pPrMatch === void 0 ? void 0 : pPrMatch[0]) !== null && _a !== void 0 ? _a : '<w:pPr><w:spacing w:after="0"/></w:pPr>';
    var replaced = "<w:p>".concat(pPr, "<w:r>").concat(logoDrawingXml(relId), "</w:r></w:p>");
    return xml.slice(0, pStart) + replaced + xml.slice(pEnd + 6);
}
function ensurePngContentType(xml) {
    if (/Extension="png"/i.test(xml))
        return xml;
    return xml.replace(/<Types\b[^>]*>/, function (open) {
        return "".concat(open, "<Default Extension=\"png\" ContentType=\"image/png\"/>");
    });
}
function ensureLogoRelationship(xml, relId) {
    if (xml.includes("Id=\"".concat(relId, "\"")))
        return xml;
    var relationship = "<Relationship Id=\"".concat(relId, "\" ") +
        "Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" " +
        "Target=\"media/".concat(LOGO_FILE_NAME, "\"/>");
    if (xml.includes('</Relationships>')) {
        return xml.replace('</Relationships>', "".concat(relationship, "</Relationships>"));
    }
    return ("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
        "".concat(relationship, "</Relationships>"));
}
function fillOfficialIdentityBlanks(xml) {
    var next = xml.replace('<w:ind w:left="2394" w:right="-2467"/>', '<w:ind w:left="60" w:right="60"/>');
    next = next.replace(/(<w:t>Identificador<\/w:t><\/w:r>[\s\S]{0,240}?<w:t>): ____________________(<\/w:t>)/, "$1: ".concat(PLACEHOLDERS.identificador, "$2"));
    next = next.replace(/(<w:t>)_____________________________(<\/w:t>)/, "$1".concat(PLACEHOLDERS.nome, "$2"));
    next = next.replace(/(Data: )____\/____\/______/, "$1".concat(PLACEHOLDERS.data));
    next = next.replace(/(<w:t>Dia<\/w:t><\/w:r>[\s\S]{0,240}?<w:t>): ____\/7(<\/w:t>)/, "$1: ".concat(PLACEHOLDERS.dia, "/7$2"));
    return next;
}
function fillOfficialMedicationCells(xml) {
    var marker = '>Medicamento</w:t>';
    var start = xml.indexOf(marker);
    if (start < 0)
        return xml;
    var emptyNameCell = /(<w:tcW w:w="(?:1555|3200)"[^/]*\/>(?:(?!<\/w:tc>)[\s\S])*?<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*<\/w:pPr>)\s*(<\/w:p>\s*<\/w:tc>)/;
    var next = xml;
    var searchFrom = start;
    for (var _i = 0, MEDICATION_PLACEHOLDERS_1 = MEDICATION_PLACEHOLDERS; _i < MEDICATION_PLACEHOLDERS_1.length; _i++) {
        var key = MEDICATION_PLACEHOLDERS_1[_i];
        var slice = next.slice(searchFrom);
        var match = slice.match(emptyNameCell);
        if (!match || match.index == null)
            break;
        var pPr = match[1].replace(/<w:jc w:val="center"\/>/, '<w:jc w:val="left"/>');
        var run = "<w:r><w:rPr><w:sz w:val=\"14\"/><w:szCs w:val=\"14\"/></w:rPr>" +
            "<w:t xml:space=\"preserve\">".concat(key, "</w:t></w:r>");
        var replacement = "".concat(pPr).concat(run).concat(match[2]);
        var abs = searchFrom + match.index;
        next =
            next.slice(0, abs) + replacement + next.slice(abs + match[0].length);
        searchFrom = abs + replacement.length;
    }
    return next;
}
/** Word usa meio-ponto: 20 = 10 pt. */
var SECTION_2_FONT_HALF_POINTS = '20';
function lastParagraphStart(xml, from) {
    return Math.max(xml.lastIndexOf('<w:p ', from), xml.lastIndexOf('<w:p>', from));
}
function applySection2FontSize(xml) {
    var startMarker = xml.indexOf('xml:space="preserve">2. </w:t>');
    if (startMarker < 0)
        return xml;
    var endMarker = xml.indexOf('>3. Sintomas', startMarker);
    if (endMarker < 0)
        return xml;
    var start = lastParagraphStart(xml, startMarker);
    var end = lastParagraphStart(xml, endMarker);
    if (start < 0 || end <= start)
        return xml;
    var section = xml.slice(start, end);
    var patched = section
        .replace(/<w:sz w:val="\d+"\/>/g, "<w:sz w:val=\"".concat(SECTION_2_FONT_HALF_POINTS, "\"/>"))
        .replace(/<w:szCs w:val="\d+"\/>/g, "<w:szCs w:val=\"".concat(SECTION_2_FONT_HALF_POINTS, "\"/>"));
    return xml.slice(0, start) + patched + xml.slice(end);
}
function prepareDiaryTemplateXml(xml) {
    var next = unfloatTables(xml);
    next = fitOfficialLayoutToA4(next);
    next = occupyLogoReservedSpace(next);
    next = replacePrimeHeaderWithLogo(next);
    next = fillOfficialIdentityBlanks(next);
    next = fillOfficialMedicationCells(next);
    next = applySection2FontSize(next);
    next = compactDiaryVerticalRhythm(next);
    next = keepSection4WithTable(next);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.m1, /(<w:t\b[^>]*>)([^<]*\bM1\b:?[^<]*)(<\/w:t>)/, /\bM1\b:?/);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.m2, /(<w:t\b[^>]*>)([^<]*\bM2\b:?[^<]*)(<\/w:t>)/, /\bM2\b:?/);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.m3, /(<w:t\b[^>]*>)([^<]*\bM3\b:?[^<]*)(<\/w:t>)/, /\bM3\b:?/);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.m4, /(<w:t\b[^>]*>)([^<]*\bM4\b:?[^<]*)(<\/w:t>)/, /\bM4\b:?/);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.m5, /(<w:t\b[^>]*>)([^<]*\bM5\b:?[^<]*)(<\/w:t>)/, /\bM5\b:?/);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.nome, /(<w:t\b[^>]*>)([^<]*\bNome\b[^<]*)(<\/w:t>)/i, /\bNome\b:?/i);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.identificador, /(<w:t\b[^>]*>)([^<]*Identificador[^<]*)(<\/w:t>)/i, /Identificador:?/i);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.data, /(<w:t\b[^>]*>)([^<]*\bData\b[^<]*)(<\/w:t>)/i, /\bData\b:?/i);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.cpf, /(<w:t\b[^>]*>)([^<]*\bCPF\b[^<]*)(<\/w:t>)/i, /\bCPF\b:?/i);
    next = insertPlaceholderOnce(next, PLACEHOLDERS.dia, /(<w:t\b[^>]*>)([^<]*\bDia\b[^<]*)(<\/w:t>)/i, /\bDia\b:?/i);
    var missing = [];
    if (!next.includes(PLACEHOLDERS.dia))
        missing.push(" Dia ".concat(PLACEHOLDERS.dia, "/7"));
    if (!next.includes(PLACEHOLDERS.nome))
        missing.push(" ".concat(PLACEHOLDERS.nome));
    if (!next.includes(PLACEHOLDERS.identificador)) {
        missing.push(" ".concat(PLACEHOLDERS.identificador));
    }
    if (!next.includes(PLACEHOLDERS.data))
        missing.push(" Data ".concat(PLACEHOLDERS.data));
    if (!next.includes(PLACEHOLDERS.m1))
        missing.push(" M1 ".concat(PLACEHOLDERS.m1));
    if (!next.includes(PLACEHOLDERS.m2))
        missing.push(" M2 ".concat(PLACEHOLDERS.m2));
    if (!next.includes(PLACEHOLDERS.m3))
        missing.push(" M3 ".concat(PLACEHOLDERS.m3));
    if (!next.includes(PLACEHOLDERS.m4))
        missing.push(" M4 ".concat(PLACEHOLDERS.m4));
    if (!next.includes(PLACEHOLDERS.m5))
        missing.push(" M5 ".concat(PLACEHOLDERS.m5));
    if (missing.length > 0) {
        next = insertAfterFirstWt(next, missing.join(''));
    }
    return next;
}
function fillDiaryCopyXml(xml, protocolDay, data) {
    var med = data.medications;
    var replacements = [
        [PLACEHOLDERS.dia, String(protocolDay)],
        [PLACEHOLDERS.nome, data.patientName || ''],
        [PLACEHOLDERS.identificador, data.publicIdentifier || ''],
        [PLACEHOLDERS.data, data.issuedDate || formatDiaryIssuedDatePt()],
        [PLACEHOLDERS.cpf, data.cpf || ''],
        [PLACEHOLDERS.m1, med.m1 || ''],
        [PLACEHOLDERS.m2, med.m2 || ''],
        [PLACEHOLDERS.m3, med.m3 || ''],
        [PLACEHOLDERS.m4, med.m4 || ''],
        [PLACEHOLDERS.m5, med.m5 || ''],
    ];
    var next = xml;
    for (var _i = 0, replacements_1 = replacements; _i < replacements_1.length; _i++) {
        var _a = replacements_1[_i], token = _a[0], value = _a[1];
        next = next.split(token).join(escapeXml(value));
    }
    return next;
}
function splitBody(xml) {
    var match = xml.match(/<w:body\b[^>]*>/);
    if (!match || match.index == null) {
        throw new Error('document.xml sem w:body');
    }
    var start = match.index + match[0].length;
    var end = xml.lastIndexOf('</w:body>');
    if (end < 0) {
        throw new Error('document.xml sem fechamento de w:body');
    }
    return {
        before: xml.slice(0, start),
        inner: xml.slice(start, end),
        after: xml.slice(end),
    };
}
function splitSectPr(inner) {
    var match = inner.match(/<w:sectPr\b[\s\S]*<\/w:sectPr>\s*$/);
    if (!match) {
        return { content: inner, sectPr: '' };
    }
    return {
        content: inner.slice(0, match.index),
        sectPr: match[0],
    };
}
function duplicateDiaryBodyXml(xml, copies, fillCopy) {
    var _a = splitBody(xml), before = _a.before, inner = _a.inner, after = _a.after;
    var _b = splitSectPr(inner), content = _b.content, sectPr = _b.sectPr;
    var baseSectPr = applyA4LandscapeSectPr(sectPr || '<w:sectPr></w:sectPr>');
    var parts = [];
    for (var day = 1; day <= copies; day += 1) {
        parts.push(fillCopy(content, day));
        if (day < copies)
            parts.push(sectionBreakParagraph(baseSectPr));
    }
    return "".concat(before).concat(parts.join('')).concat(baseSectPr).concat(after);
}
function resolvePrimeLogoPath() {
    var _a;
    var assetsDir = (0, path_1.join)(__dirname, 'assets');
    var assetsPath = (0, path_1.join)(assetsDir, LOGO_FILE_NAME);
    var originals = [
        (0, path_1.join)(__dirname, '../../../../prime/public', LOGO_FILE_NAME),
        (0, path_1.join)(process.cwd(), '../../prime/public', LOGO_FILE_NAME),
        (0, path_1.join)(process.cwd(), '../prime/public', LOGO_FILE_NAME),
        (0, path_1.join)(process.cwd(), 'prime/public', LOGO_FILE_NAME),
    ];
    if (!(0, fs_1.existsSync)(assetsPath)) {
        var original = originals.find(function (candidate) { return (0, fs_1.existsSync)(candidate); });
        if (original) {
            try {
                (0, fs_1.mkdirSync)(assetsDir, { recursive: true });
                (0, fs_1.copyFileSync)(original, assetsPath);
            }
            catch (_b) {
                return original;
            }
        }
    }
    var candidates = __spreadArray([
        assetsPath,
        (0, path_1.join)(process.cwd(), 'src/modules/freeliving/assets', LOGO_FILE_NAME),
        (0, path_1.join)(process.cwd(), 'dist/modules/freeliving/assets', LOGO_FILE_NAME)
    ], originals, true);
    return (_a = candidates.find(function (candidate) { return (0, fs_1.existsSync)(candidate); })) !== null && _a !== void 0 ? _a : null;
}
function resolveDiaryTemplatePath() {
    var assetsDir = (0, path_1.join)(__dirname, 'assets');
    var assetsPath = (0, path_1.join)(assetsDir, TEMPLATE_FILE_NAME);
    var originals = [
        (0, path_1.join)(__dirname, '../../../../diario_prime_free_living_formulario_revisado_final.docx'),
        (0, path_1.join)(process.cwd(), '../../diario_prime_free_living_formulario_revisado_final.docx'),
        (0, path_1.join)(process.cwd(), 'diario_prime_free_living_formulario_revisado_final.docx'),
    ];
    if (!(0, fs_1.existsSync)(assetsPath)) {
        var original = originals.find(function (candidate) { return (0, fs_1.existsSync)(candidate); });
        if (original) {
            try {
                (0, fs_1.mkdirSync)(assetsDir, { recursive: true });
                (0, fs_1.copyFileSync)(original, assetsPath);
            }
            catch (_a) {
                return original;
            }
        }
    }
    var candidates = __spreadArray([
        assetsPath,
        (0, path_1.join)(process.cwd(), 'src/modules/freeliving/assets', TEMPLATE_FILE_NAME),
        (0, path_1.join)(process.cwd(), 'dist/modules/freeliving/assets', TEMPLATE_FILE_NAME)
    ], originals, true);
    var found = candidates.find(function (candidate) { return (0, fs_1.existsSync)(candidate); });
    if (!found) {
        throw new Error('Template do diário Free Living não encontrado (diario_prime_free_living.docx)');
    }
    return found;
}
function diaryDocumentFileName(patientName, publicIdentifier) {
    var id = (publicIdentifier || '').trim() || 'paciente';
    var slug = (patientName || 'diario')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
    return "diario_free_living_".concat(id, "_").concat(slug, "_7dias.docx");
}
function buildFreelivingDiaryDocument(data, templateBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, zip, documentFile, originalXml, fillData, prepared, filled, logoPath, contentTypesFile, _a, _b, _c, _d, relsFile, _e, _f, _g, _h, _j, output;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    buffer = templateBuffer !== null && templateBuffer !== void 0 ? templateBuffer : (0, fs_1.readFileSync)(resolveDiaryTemplatePath());
                    return [4 /*yield*/, JSZip.loadAsync(buffer)];
                case 1:
                    zip = _k.sent();
                    documentFile = zip.file(DOCUMENT_XML_PATH);
                    if (!documentFile) {
                        throw new Error('Template DOCX inválido: falta word/document.xml');
                    }
                    return [4 /*yield*/, documentFile.async('string')];
                case 2:
                    originalXml = _k.sent();
                    fillData = __assign(__assign({}, data), { issuedDate: data.issuedDate || formatDiaryIssuedDatePt() });
                    prepared = prepareDiaryTemplateXml(originalXml);
                    filled = duplicateDiaryBodyXml(prepared, exports.DIARY_DOCUMENT_COPIES, function (content, protocolDay) {
                        return fillDiaryCopyXml(content.replace('<wp:docPr id="90"', "<wp:docPr id=\"".concat(90 + protocolDay, "\"")), protocolDay, fillData);
                    });
                    zip.file(DOCUMENT_XML_PATH, filled);
                    logoPath = resolvePrimeLogoPath();
                    if (!(logoPath && prepared.includes("r:embed=\"".concat(LOGO_REL_ID, "\"")))) return [3 /*break*/, 8];
                    zip.file(LOGO_MEDIA_PATH, (0, fs_1.readFileSync)(logoPath));
                    contentTypesFile = zip.file(CONTENT_TYPES_PATH);
                    if (!contentTypesFile) return [3 /*break*/, 4];
                    _b = (_a = zip).file;
                    _c = [CONTENT_TYPES_PATH];
                    _d = ensurePngContentType;
                    return [4 /*yield*/, contentTypesFile.async('string')];
                case 3:
                    _b.apply(_a, _c.concat([_d.apply(void 0, [_k.sent()])]));
                    _k.label = 4;
                case 4:
                    relsFile = zip.file(DOCUMENT_RELS_PATH);
                    _f = (_e = zip).file;
                    _g = [DOCUMENT_RELS_PATH];
                    _h = ensureLogoRelationship;
                    if (!relsFile) return [3 /*break*/, 6];
                    return [4 /*yield*/, relsFile.async('string')];
                case 5:
                    _j = _k.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _j = '';
                    _k.label = 7;
                case 7:
                    _f.apply(_e, _g.concat([_h.apply(void 0, [_j, LOGO_REL_ID])]));
                    _k.label = 8;
                case 8: return [4 /*yield*/, zip.generateAsync({
                        type: 'nodebuffer',
                        compression: 'DEFLATE',
                    })];
                case 9:
                    output = _k.sent();
                    return [2 /*return*/, {
                            buffer: output,
                            fileName: diaryDocumentFileName(data.patientName, data.publicIdentifier),
                        }];
            }
        });
    });
}
function createMinimalDiaryTemplate(options) {
    return __awaiter(this, void 0, void 0, function () {
        var includeLabels, labels, documentXml, zip;
        return __generator(this, function (_a) {
            includeLabels = (options === null || options === void 0 ? void 0 : options.includeLabels) !== false;
            labels = includeLabels
                ? 'Nome Identificador CPF Data Dia M1 M2 M3 M4 M5'
                : 'Formulario Free Living';
            documentXml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">\n  <w:body>\n    <w:p><w:r><w:t>".concat(labels, "</w:t></w:r></w:p>\n    <w:sectPr>").concat(A4_LANDSCAPE_PGSZ, "</w:sectPr>\n  </w:body>\n</w:document>");
            zip = new JSZip();
            zip.file('[Content_Types].xml', "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">\n  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>\n  <Default Extension=\"xml\" ContentType=\"application/xml\"/>\n  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>\n</Types>");
            zip.file('_rels/.rels', "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\n  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>\n</Relationships>");
            zip.file(DOCUMENT_XML_PATH, documentXml);
            return [2 /*return*/, zip.generateAsync({ type: 'nodebuffer' })];
        });
    });
}
