"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUdysrsQExportValues = exports.formatMeemLanguageNaming = exports.joinSubjectDataCsvRow = exports.pickExportValue = exports.formatNeurologicalScoreCsv = exports.UDYSRS_Q_EXPORT_FIELD_ORDER = void 0;
/** Ordem de exportação UDysRS q1–q26 (campos semânticos) + q27/q28 (subscores). */
exports.UDYSRS_Q_EXPORT_FIELD_ORDER = [
    'on_dyskinesia_time',
    'impact_speech',
    'impact_chewing',
    'impact_eating',
    'impact_dressing',
    'impact_hygiene',
    'impact_writing',
    'impact_hobbies',
    'impact_walking',
    'impact_social',
    'impact_emotional',
    'off_dystonia_time',
    'dystonia_activities',
    'dystonia_pain_impact',
    'dystonia_pain_severity',
    'severity_face',
    'severity_neck',
    'severity_right_arm',
    'severity_left_arm',
    'severity_trunk',
    'severity_right_leg',
    'severity_left_leg',
    'disability_communication',
    'disability_drinking',
    'disability_dressing',
    'disability_walking',
    'historical_subscore',
    'objective_subscore',
];
var formatNeurologicalScoreCsv = function (value) {
    if (value === null || value === undefined)
        return '';
    if (typeof value === 'boolean')
        return value ? '1' : '0';
    if (typeof value === 'string') {
        var normalized = value.trim().toLowerCase();
        if (normalized === 'true')
            return '1';
        if (normalized === 'false')
            return '0';
    }
    return String(value);
};
exports.formatNeurologicalScoreCsv = formatNeurologicalScoreCsv;
/** Primeiro valor definido (inclui `false` e `0`; ignora string vazia). */
var pickExportValue = function () {
    var candidates = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        candidates[_i] = arguments[_i];
    }
    for (var _a = 0, candidates_1 = candidates; _a < candidates_1.length; _a++) {
        var value = candidates_1[_a];
        if (value !== null && value !== undefined && value !== '')
            return value;
    }
    for (var _b = 0, candidates_2 = candidates; _b < candidates_2.length; _b++) {
        var value = candidates_2[_b];
        if (value === false || value === 0)
            return value;
    }
    return '';
};
exports.pickExportValue = pickExportValue;
var escapeSubjectDataCsvCell = function (value) {
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return "\"".concat(value.replace(/"/g, '""'), "\"");
    }
    return value;
};
/** Linha CSV de Subject_Data com booleans normalizados (0/1), como UPDRS. */
var joinSubjectDataCsvRow = function (values) {
    return values
        .map(function (value) { return (0, exports.formatNeurologicalScoreCsv)(value); })
        .map(escapeSubjectDataCsvCell)
        .join(',');
};
exports.joinSubjectDataCsvRow = joinSubjectDataCsvRow;
var formatMeemLanguageNaming = function (meem) {
    var parts = [meem.language_naming1, meem.language_naming2]
        .filter(function (v) { return v !== null && v !== undefined && v !== ''; })
        .map(function (v) { return String(v); });
    if (parts.length > 0)
        return parts.join('|');
    var legacy = meem.language_naming;
    return legacy !== null && legacy !== undefined ? String(legacy) : '';
};
exports.formatMeemLanguageNaming = formatMeemLanguageNaming;
var getUdysrsQExportValues = function (udysrs) {
    return exports.UDYSRS_Q_EXPORT_FIELD_ORDER.map(function (field) {
        return (0, exports.formatNeurologicalScoreCsv)(udysrs === null || udysrs === void 0 ? void 0 : udysrs[field]);
    });
};
exports.getUdysrsQExportValues = getUdysrsQExportValues;
