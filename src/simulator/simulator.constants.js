import * as cl from './simulator.constants.cl';
import * as ar from './simulator.constants.ar';

export const CONFIG = {
  cl,
  ar,
};

// Also export default things so current files don't break if they still import directly while refactoring
export const API_BASE = cl.API_BASE;
export const DEFAULT_CREDENTIALS = cl.DEFAULT_CREDENTIALS;
export const FIELD_CONFIG = cl.FIELD_CONFIG;
export const COMMAND_METHODS = cl.COMMAND_METHODS;
export const EXAMPLE_BODY_C2C_SALE = cl.EXAMPLE_BODY_C2C_SALE;
