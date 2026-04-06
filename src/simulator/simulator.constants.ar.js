import {
  Cloud, Zap, RefreshCw, Send, History, Tag, Undo2,
  XCircle, FileText, RotateCcw, Copy, Fingerprint, Printer, ToggleRight
} from 'lucide-react';

export const API_BASE = {
  dev: '/ar-api-dev/',
  uat: '/ar-api-uat/',
  prod: '/ar-api-prod/',
};

export const DEFAULT_CREDENTIALS = {
  clientId: import.meta.env.VITE_AR_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_AR_CLIENT_SECRET || '',
};

export const AUTH_CONFIG = {
  endpoint: 'auth',
  contentType: 'form',
  headers: {
    'env': 'uat',
    'country': 'ar',
    'app': 'posintegrado'
  },
  payloadKeys: {
    clientId: 'ClientId',
    clientSecret: 'ClientSecret'
  }
};

export const FIELD_CONFIG = {
  idTerminal: { label: 'field.idTerminal', type: 'text', span: 1 },
  idSucursal: { label: 'field.idSucursal', type: 'text', span: 1 },
  serialNumber: { label: 'field.serialNumber', type: 'text', span: 2 },
  amount: { label: 'field.amount', type: 'number', span: 1 },
  customId: { label: 'field.customId', type: 'text', span: 1 },
  tip: { label: 'field.tip', type: 'number', span: 1 },
  printOnPos: { label: 'field.printOnPos', type: 'toggle', span: 2 },
  saleType: { label: 'field.saleType', type: 'number', span: 1 },
  employeeId: { label: 'field.employeeId', type: 'number', span: 1 },
  installments: { label: 'field.installments', type: 'number', span: 1 },
  planId: { label: 'field.planId', type: 'text', span: 1 },
  interest: { label: 'field.interest', type: 'number', span: 1 },
  operationMode: { label: 'field.operationMode', type: 'number', span: 1 },
  skipConfirmation: { label: 'field.skipConfirmation', type: 'toggle', span: 2 },
  skipReceipt: { label: 'field.skipReceipt', type: 'toggle', span: 2 },
  authorizationCode: { label: 'field.authCode', type: 'text', span: 1 },
  originalTransDate: { label: 'field.originalDate', type: 'date', span: 2 },
};

const BODY_POLL_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 106,
  customId: '1234',
};

const BODY_PARAMS_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 114,
  customId: '1234',
};

const BODY_SALE_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 100,
  amount: 120000,
  tip: 1000,
  printOnPos: true,
  saleType: 0,
  employeeId: 1,
  installments: 1,
  planId: "contado",
  interest: 0,
  operationMode: 0,
  skipConfirmation: false,
  skipReceipt: false,
  customId: "1234"
};

const BODY_RETURN_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 108,
  authorizationCode: "",
  originalTransDate: "2025-10-09T14:47:34.402Z",
  skipConfirmation: false,
  skipReceipt: false,
  printOnPos: true,
  amount: 0,
  originalTransDate: "2025-10-09",
  customId: "1234"
};

const BODY_LASTVOUCHER_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 101,
  printOnPos: true,
  skipReceipt: false,
  customId: "1234"
};

const BODY_DETAILS_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 105,
  printOnPos: true,
  customId: "1234"
};

const BODY_TOTALS_AR = {
  idTerminal: 'AR001S4K',
  idSucursal: '0000087294',
  serialNumber: 'NAC101116123',
  command: 104,
  printOnPos: true,
  customId: "1234"
};

export const COMMAND_METHODS = [
  {
    id: 'poll_ar', label: 'cmd.validate_ar', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10',
    endpoint: 'poll',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'customId'],
    template: BODY_POLL_AR,
  },
  {
    id: 'params_ar', label: 'cmd.params_ar', icon: FileText, color: 'text-sky-500', bg: 'bg-sky-500/10',
    endpoint: 'params',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'customId'],
    template: BODY_PARAMS_AR,
  },
  {
    id: 'sale_ar', label: 'cmd.sale_ar', icon: Cloud, color: 'text-accent', bg: 'bg-accent/10',
    endpoint: 'sale',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'amount', 'tip', 'installments', 'planId', 'printOnPos', 'customId'],
    template: BODY_SALE_AR,
  },
  {
    id: 'return_ar', label: 'cmd.return_ar', icon: Undo2, color: 'text-orange-500', bg: 'bg-orange-500/10',
    endpoint: 'return',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'amount', 'authorizationCode', 'originalTransDate', 'printOnPos', 'customId'],
    template: BODY_RETURN_AR,
  },
  {
    id: 'lastvoucher_ar', label: 'cmd.lastvoucher_ar', icon: Printer, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
    endpoint: 'lastvoucher',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'printOnPos', 'customId'],
    template: BODY_LASTVOUCHER_AR,
  },
  {
    id: 'details_ar', label: 'cmd.details_ar', icon: History, color: 'text-purple-500', bg: 'bg-purple-500/10',
    endpoint: 'details',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'printOnPos', 'customId'],
    template: BODY_DETAILS_AR,
  },
  {
    id: 'totals_ar', label: 'cmd.totals_ar', icon: Tag, color: 'text-blue-500', bg: 'bg-blue-500/10',
    endpoint: 'totals',
    fields: ['idTerminal', 'idSucursal', 'serialNumber', 'printOnPos', 'customId'],
    template: BODY_TOTALS_AR,
  }
];

export const EXAMPLE_BODY_C2C_SALE = BODY_SALE_AR;
