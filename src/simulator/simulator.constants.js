import {
  Cloud, Zap, RefreshCw, Send, History, Tag, Undo2,
  XCircle, FileText, RotateCcw, Copy, Fingerprint, Printer, ToggleRight
} from 'lucide-react';

export const API_BASE = {
  uat: 'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/',
  prod: 'https://api-getnet-posintegrado.ione.cl/api/postxs/',
};

export const DEFAULT_CREDENTIALS = {
  clientId: '',
  clientSecret: '',
};

// ─── Field metadata ────────────────────────────────────────────────────────────
// type: 'text' | 'number' | 'toggle' (boolean)
// span: 1 | 2 columns in the 2-col grid
export const FIELD_CONFIG = {
  idTerminal: { label: 'field.idTerminal', type: 'number', span: 1 },
  idSucursal: { label: 'field.idSucursal', type: 'number', span: 1 },
  serialNumber: { label: 'field.serialNumber', type: 'text', span: 2 },
  amount: { label: 'field.amount', type: 'number', span: 1 },
  ticketNumber: { label: 'field.ticketNumber', type: 'text', span: 1 },
  customId: { label: 'field.customId', type: 'text', span: 2 },
  idPromo: { label: 'field.idPromo', type: 'text', span: 2 },
  operationId: { label: 'field.operationId', type: 'number', span: 1 },
  authorizationCode: { label: 'field.authCode', type: 'text', span: 1 },
  installments: { label: 'field.installments', type: 'number', span: 1 },
  printOnPos: { label: 'field.printOnPos', type: 'toggle', span: 2 },
  c2cMode: { label: 'field.c2cMode', type: 'toggle', span: 2 },
  rutToValidate: { label: 'field.rutToValidate', type: 'text', span: 1 },
  authType: { label: 'field.authType', type: 'number', span: 1 },
};

// ─── Templates ─────────────────────────────────────────────────────────────────

const BODY_C2C_SALE = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 100, amount: 5200, ticketNumber: '12',
  printOnPos: false, saleType: 1, employeeId: 1, customId: '1234',
};

const BODY_SALE_PROMO = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 126, amount: 0, ticketNumber: '',
  printOnPos: false, saleType: 1, employeeId: 1, idPromo: '',
};

const BODY_REFUND_V2 = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 102, operationId: 12, printOnPos: false, customId: '1234',
};

const BODY_CLOSE = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 103, printOnPos: false, customId: '1234',
};

const BODY_DETAILS = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 105, printOnPos: false, customId: '1234',
};

const BODY_RETURN = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 108, authorizationCode: '', amount: 0,
  printOnPos: false, customId: '',
};

const BODY_DUPLICATE = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 109, operationId: 12, printOnPos: false, customId: '1234',
};

const BODY_BIOAUTH = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 121, rutToValidate: '', authType: 0, customId: '',
};

const BODY_PRINT_SERVICE = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 117, customId: '1234',
  details: [
    { printSeq: 1, type: 'text', encode: '', data: 'Este texto debe ser de maximo -48- caracteres...', align: 'left' },
    { printSeq: 2, type: 'text', encode: '', data: 'Este texto debe ser de maximo -48- caracteres...', align: 'left' },
    { printSeq: 3, type: 'text', encode: '', data: 'Ct Descrip.            SKU         P/U', align: 'left' },
    {
      printSeq: 4, type: 'array', encode: '', data: [
        { item0: '99 Producto en venta 0 12345678901 $ 999.999.999' },
        { item1: '99 Producto en venta 1 12345678901 $ 999.999.999' },
        { item2: '99 Producto en venta 2 12345678901 $ 999.999.999' },
      ], align: 'left'
    },
    { printSeq: 6, type: 'barcode', encode: 'ean13', data: '1234567890123', align: 'center' },
    { printSeq: 7, type: 'printcode', encode: 'qr', data: 'Este es un código QR', align: 'center' },
    { printSeq: 8, type: 'printcode', encode: 'pdf417', data: 'Este es un código PDF417 del SII', align: 'center' },
  ],
};

const BODY_C2C_MODE = {
  idTerminal: '', idSucursal: '', serialNumber: '',
  command: 129, c2cMode: false,
};

const BODY_LAST = { command: 400 };

// ─── Command list ───────────────────────────────────────────────────────────────

export const COMMAND_METHODS = [
  {
    id: 'c2c_sale', label: 'cmd.c2c_sale', icon: Cloud, color: 'text-accent', bg: 'bg-accent/10',
    endpoint: 'sale',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'amount', 'ticketNumber', 'customId', 'printOnPos'],
    template: BODY_C2C_SALE,
  },
  {
    id: 'sale_promo', label: 'cmd.sale_promo', icon: Tag, color: 'text-violet-500', bg: 'bg-violet-500/10',
    endpoint: 'salepromo',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'amount', 'ticketNumber', 'idPromo', 'printOnPos'],
    template: BODY_SALE_PROMO,
  },
  {
    id: 'refund_v2', label: 'cmd.refund', icon: Undo2, color: 'text-orange-500', bg: 'bg-orange-500/10',
    endpoint: 'refund',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'operationId', 'customId', 'printOnPos'],
    template: BODY_REFUND_V2,
  },
  {
    id: 'close', label: 'cmd.close', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10',
    endpoint: 'close',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'customId', 'printOnPos'],
    template: BODY_CLOSE,
  },
  {
    id: 'details', label: 'cmd.details', icon: FileText, color: 'text-sky-500', bg: 'bg-sky-500/10',
    endpoint: 'details',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'customId', 'printOnPos'],
    template: BODY_DETAILS,
  },
  {
    id: 'return', label: 'cmd.return', icon: RotateCcw, color: 'text-amber-500', bg: 'bg-amber-500/10',
    endpoint: 'return',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'authorizationCode', 'amount', 'customId', 'printOnPos'],
    template: BODY_RETURN,
  },
  {
    id: 'duplicate', label: 'cmd.duplicate', icon: Copy, color: 'text-teal-500', bg: 'bg-teal-500/10',
    endpoint: 'duplicate',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'operationId', 'customId', 'printOnPos'],
    template: BODY_DUPLICATE,
  },
  {
    id: 'bioauth', label: 'cmd.bioauth', icon: Fingerprint, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
    endpoint: 'bioauth',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'rutToValidate', 'authType', 'customId'],
    template: BODY_BIOAUTH,
  },
  {
    id: 'print_service', label: 'cmd.print', icon: Printer, color: 'text-indigo-400', bg: 'bg-indigo-400/10',
    endpoint: 'printservice',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'customId'],
    template: BODY_PRINT_SERVICE,
  },
  {
    id: 'c2c_mode', label: 'cmd.c2c_mode', icon: ToggleRight, color: 'text-cyan-500', bg: 'bg-cyan-500/10',
    endpoint: 'c2cmode',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'c2cMode'],
    template: BODY_C2C_MODE,
  },
];

// Backwards compat
export const EXAMPLE_BODY_C2C_SALE = BODY_C2C_SALE;
