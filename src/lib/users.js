import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_PATH = join(__dirname, '../../data/users.json');

let usersData = null;

export function loadUsers() {
  if (usersData) {
    return usersData;
  }

  if (!existsSync(USERS_PATH)) {
    usersData = {};
    return usersData;
  }

  const content = readFileSync(USERS_PATH, 'utf8');
  usersData = JSON.parse(content);
  return usersData;
}

export function getUserName(userId) {
  const users = loadUsers();
  return users[userId] || null;
}

export function getActiveUserIds() {
  const users = loadUsers();
  return new Set(Object.keys(users));
}

export function isActiveUser(userId) {
  const users = loadUsers();
  return userId in users;
}

export function setUsersData(data) {
  usersData = data;
}

export function resetUsers() {
  usersData = null;
}
