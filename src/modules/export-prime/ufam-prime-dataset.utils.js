"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueFilenameUfam = exports.buildUfamPatientFolderName = exports.anonimizarCpfNoFilename = exports.gerarHashCPFSimples = exports.ufamPrimePdfReportZipPath = exports.FREE_LIVING_EXPORT_TASK_CODES = void 0;
exports.isFreeLivingExportTaskCode = isFreeLivingExportTaskCode;
exports.isSelectivePrimeExport = isSelectivePrimeExport;
exports.resolvePrimeZipName = resolvePrimeZipName;
exports.resolveUfamBinaryTaskCode = resolveUfamBinaryTaskCode;
exports.ufamBinaryZipFolder = ufamBinaryZipFolder;
var samsung_dataset_utils_1 = require("../samsung-sync/samsung-dataset.utils");
exports.FREE_LIVING_EXPORT_TASK_CODES = ['FL01', 'FL02', 'FL03'];
function isFreeLivingExportTaskCode(taskCode) {
    var code = (taskCode || '').trim().toUpperCase();
    return exports.FREE_LIVING_EXPORT_TASK_CODES.includes(code);
}
/** True quando o request pede export filtrado (não o ZIP completo legado). */
function isSelectivePrimeExport(filters) {
    return (filters.includeClinicalQuestionnaires !== undefined ||
        filters.includeSleepQuestionnaires !== undefined ||
        filters.includeFreeLivingQuestionnaires !== undefined ||
        filters.taskCodes !== undefined ||
        filters.pdfTypes !== undefined);
}
function resolvePrimeZipName(filters) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!isSelectivePrimeExport(filters)) {
        return 'Dados_Todos_Pacientes.zip';
    }
    var hasClinic = filters.includeClinicalQuestionnaires === true ||
        ((_b = (_a = filters.taskCodes) === null || _a === void 0 ? void 0 : _a.some(function (c) {
            var code = c.toUpperCase();
            return code !== 'TA13' && !isFreeLivingExportTaskCode(code);
        })) !== null && _b !== void 0 ? _b : false) ||
        ((_d = (_c = filters.pdfTypes) === null || _c === void 0 ? void 0 : _c.some(function (t) { return t === 'BIOBIT' || t === 'DELSYS'; })) !== null && _d !== void 0 ? _d : false);
    var hasSleep = filters.includeSleepQuestionnaires === true ||
        ((_f = (_e = filters.taskCodes) === null || _e === void 0 ? void 0 : _e.some(function (c) { return c.toUpperCase() === 'TA13'; })) !== null && _f !== void 0 ? _f : false) ||
        ((_h = (_g = filters.pdfTypes) === null || _g === void 0 ? void 0 : _g.includes('POLYSOMNOGRAPHY')) !== null && _h !== void 0 ? _h : false);
    var hasFreeLiving = filters.includeFreeLivingQuestionnaires === true ||
        ((_k = (_j = filters.taskCodes) === null || _j === void 0 ? void 0 : _j.some(function (c) { return isFreeLivingExportTaskCode(c); })) !== null && _k !== void 0 ? _k : false);
    var kinds = [hasClinic, hasSleep, hasFreeLiving].filter(Boolean).length;
    if (kinds === 1 && hasClinic)
        return 'Dados_Clinicos.zip';
    if (kinds === 1 && hasSleep)
        return 'Dados_Sono.zip';
    if (kinds === 1 && hasFreeLiving)
        return 'Dados_FreeLiving.zip';
    return 'Dados_Selecionados.zip';
}
function resolveUfamBinaryTaskCode(collection) {
    var _a, _b;
    var fromTask = (_a = collection.active_task) === null || _a === void 0 ? void 0 : _a.task_code;
    var fromMeta = (_b = collection.metadata) === null || _b === void 0 ? void 0 : _b.task_code;
    return String(fromTask || fromMeta || '')
        .trim()
        .toUpperCase();
}
function ufamBinaryZipFolder(taskCode) {
    var code = (taskCode || '').trim().toUpperCase();
    if (isFreeLivingExportTaskCode(code)) {
        return "FreeLiving/".concat(code);
    }
    return 'Active_Tasks';
}
/** PDFs no ZIP UFAM/PRIME: Clinic|Sleep/{device}/... */
var ufamPrimePdfReportZipPath = function (reportType) {
    var _a = (0, samsung_dataset_utils_1.samsungPdfReportDataPath)(reportType), protocol = _a.protocol, device = _a.device;
    return "".concat(protocol, "/").concat(device);
};
exports.ufamPrimePdfReportZipPath = ufamPrimePdfReportZipPath;
/** Hash curto do CPF para pasta — alinhado ao frontend (gerarHashCPF). */
var gerarHashCPFSimples = function (cpf) {
    var cpfLimpo = (cpf || '').replace(/\D/g, '');
    var hash = 0;
    for (var i = 0; i < cpfLimpo.length; i++) {
        var char = cpfLimpo.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
};
exports.gerarHashCPFSimples = gerarHashCPFSimples;
/** Anonimiza prefixo CPF no nome do arquivo — alinhado ao frontend. */
var anonimizarCpfNoFilename = function (fileName, cpfHash) {
    var shortHash = (cpfHash || '').substring(0, 8);
    if (!fileName)
        return shortHash;
    var idx = fileName.indexOf('_');
    if (idx === -1)
        return "".concat(shortHash, "_").concat(fileName);
    return "".concat(shortHash, "_").concat(fileName.substring(idx + 1));
};
exports.anonimizarCpfNoFilename = anonimizarCpfNoFilename;
var buildUfamPatientFolderName = function (publicIdentifier, cpf) {
    var patientIdentifier = (publicIdentifier || 'Paciente').trim();
    var cpfHashForFolder = (0, exports.gerarHashCPFSimples)(cpf || '');
    return "".concat(patientIdentifier, "_").concat(cpfHashForFolder);
};
exports.buildUfamPatientFolderName = buildUfamPatientFolderName;
/** Mesma regra do getUniqueFilename em busca-questionarios/page.tsx */
var getUniqueFilenameUfam = function (baseName, counterMap, scopePrefix) {
    if (scopePrefix === void 0) { scopePrefix = ''; }
    var safeBaseName = baseName && baseName.trim() !== '' ? baseName.trim() : 'file';
    var dotIndex = safeBaseName.lastIndexOf('.');
    var name = dotIndex > 0 ? safeBaseName.slice(0, dotIndex) : safeBaseName;
    var ext = dotIndex > 0 ? safeBaseName.slice(dotIndex) : '';
    var countKey = scopePrefix ? "".concat(scopePrefix, "/").concat(safeBaseName) : safeBaseName;
    var current = (counterMap.get(countKey) || 0) + 1;
    counterMap.set(countKey, current);
    if (current === 1)
        return safeBaseName;
    return "".concat(name, "(").concat(current, ")").concat(ext);
};
exports.getUniqueFilenameUfam = getUniqueFilenameUfam;
