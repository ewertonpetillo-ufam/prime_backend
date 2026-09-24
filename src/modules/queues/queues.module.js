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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesModule = exports.PDF_REPORT_UPLOAD_QUEUE = exports.BART_SYNC_QUEUE = exports.EXPORT_PRIME_QUEUE = exports.EXPORT_ZIP_QUEUE = void 0;
var bullmq_1 = require("@nestjs/bullmq");
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
exports.EXPORT_ZIP_QUEUE = 'export-zip';
exports.EXPORT_PRIME_QUEUE = 'export-prime';
exports.BART_SYNC_QUEUE = 'bart-sync';
exports.PDF_REPORT_UPLOAD_QUEUE = 'pdf-report-upload';
var QueuesModule = /** @class */ (function () {
    function QueuesModule() {
    }
    QueuesModule = __decorate([
        (0, common_1.Global)(),
        (0, common_1.Module)({
            imports: [
                bullmq_1.BullModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: function (config) {
                        var password = config.get('REDIS_PASSWORD');
                        return {
                            connection: __assign(__assign({ host: config.get('REDIS_HOST', 'localhost'), port: config.get('REDIS_PORT', 6379) }, (password ? { password: password } : {})), { db: config.get('REDIS_DB', 0) }),
                        };
                    },
                    inject: [config_1.ConfigService],
                }),
                bullmq_1.BullModule.registerQueue({ name: exports.EXPORT_ZIP_QUEUE }),
                bullmq_1.BullModule.registerQueue({ name: exports.EXPORT_PRIME_QUEUE }),
                bullmq_1.BullModule.registerQueue({ name: exports.BART_SYNC_QUEUE }),
                bullmq_1.BullModule.registerQueue({ name: exports.PDF_REPORT_UPLOAD_QUEUE }),
            ],
            exports: [bullmq_1.BullModule],
        })
    ], QueuesModule);
    return QueuesModule;
}());
exports.QueuesModule = QueuesModule;
