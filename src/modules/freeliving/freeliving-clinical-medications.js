"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMedicationLabel = formatMedicationLabel;
exports.toMedicationLabels = toMedicationLabels;
exports.mapMedicationRows = mapMedicationRows;
function formatMedicationLabel(name, doseMg) {
    var trimmed = (name || '').trim();
    if (!trimmed)
        return '';
    var dose = doseMg == null ? NaN : Number(doseMg);
    if (!Number.isFinite(dose) || dose <= 0)
        return trimmed;
    var formatted = Number.isInteger(dose) ? String(dose) : String(dose);
    return "".concat(trimmed, " ").concat(formatted, " mg");
}
function toMedicationLabels(slots) {
    var _a, _b, _c, _d, _e;
    return {
        m1: ((_a = slots[0]) === null || _a === void 0 ? void 0 : _a.label) || null,
        m2: ((_b = slots[1]) === null || _b === void 0 ? void 0 : _b.label) || null,
        m3: ((_c = slots[2]) === null || _c === void 0 ? void 0 : _c.label) || null,
        m4: ((_d = slots[3]) === null || _d === void 0 ? void 0 : _d.label) || null,
        m5: ((_e = slots[4]) === null || _e === void 0 ? void 0 : _e.label) || null,
    };
}
function mapMedicationRows(rows) {
    var mapped = rows
        .map(function (row) {
        var name = (row.drug_name || '').trim();
        var doseMgRaw = row.dose_mg == null || row.dose_mg === '' ? null : Number(row.dose_mg);
        var doseMg = doseMgRaw != null && Number.isFinite(doseMgRaw) ? doseMgRaw : null;
        var dosesRaw = row.doses_per_day == null || row.doses_per_day === ''
            ? null
            : Number(row.doses_per_day);
        var dosesPerDay = dosesRaw != null && Number.isFinite(dosesRaw) ? dosesRaw : null;
        return {
            name: name,
            doseMg: doseMg,
            dosesPerDay: dosesPerDay,
            label: formatMedicationLabel(name, doseMg),
        };
    })
        .filter(function (row) { return row.label; });
    return {
        slots: mapped.slice(0, 5),
        extraCount: Math.max(0, mapped.length - 5),
    };
}
