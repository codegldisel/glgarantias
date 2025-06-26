#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const MIN_NODE_VERSION = '18.0.0';

function checkNodeVersion() {
  const current = process.versions.node;
  const min = MIN_NODE_VERSION.split('.').map(Number);
  const cur = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (cur[i] > min[i]) return true;
    if (cur[i] < min[i]) return false;
  }
  return true;
}

function checkEnvFile() {
  return fs.existsSync(path.join(__dirname, '.env'));
}

function checkEnvVars() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return { SUPABASE_URL: false, SUPABASE_ANON_KEY: false };
  const env = dotenv.parse(fs.readFileSync(envPath));
  return {
    SUPABASE_URL: !!env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!env.SUPABASE_ANON_KEY,
  };
}

function checkNodeModules() {
  return fs.existsSync(path.join(__dirname, 'node_modules'));
}

console.log('--- Verificação de Ambiente Backend ---');

// Node.js version
if (checkNodeVersion()) {
  console.log('✔ Node.js >= 18.0.0 ... OK');
} else {
  console.log('✖ Node.js >= 18.0.0 ... FALTA/ERRADO');
}

// .env file
if (checkEnvFile()) {
  console.log('✔ .env ... OK');
} else {
  console.log('✖ .env ... FALTA');
}

// Env vars
const envVars = checkEnvVars();
if (envVars.SUPABASE_URL) {
  console.log('✔ SUPABASE_URL ... OK');
} else {
  console.log('✖ SUPABASE_URL ... FALTA');
}
if (envVars.SUPABASE_ANON_KEY) {
  console.log('✔ SUPABASE_ANON_KEY ... OK');
} else {
  console.log('✖ SUPABASE_ANON_KEY ... FALTA');
}

// node_modules
if (checkNodeModules()) {
  console.log('✔ node_modules ... OK');
} else {
  console.log('✖ node_modules ... FALTA (rode npm install)');
} 