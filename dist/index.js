"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.json({ message: "SUCCESS SA MERE LACCUEIL" });
});
app.get('/api/messages', (req, res) => {
    res.json({ message: "SUCCESS SA MERE" });
});
app.listen(5000, () => {
    console.log('Server started on port 5000');
});
//# sourceMappingURL=index.js.map