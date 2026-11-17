// import { http, request } from "./http";

// // ---------------- Dashboard ----------------
// export const getDashboardStats = (days = 30) => http.get("/api/dashboard", { days });
// export const getEmployeePerformance = () => http.get("/api/employee-performance");

// // ---------------- Departments & profiles ----------------
// export const getDepartments = () => http.get("/api/departments");
// export const createDepartment = (name) => http.post("/api/departments", { name });
// export const getProfiles = () => http.get("/api/profiles");
// export const updateProfile = (id, patch) => http.patch(`/api/profiles/${id}`, patch);
// /** input: { email, password, full_name, phone, role, department_id } */
// export const createEmployee = (input) => http.post("/api/profiles", input);

// // ---------------- Leads ----------------
// /** f: { search, status, source, assigned_to, sort, dir, page, pageSize } -> { rows, count } */
// export const getLeads = (f = {}) => http.get("/api/leads", f);
// export const getLead = (id) => http.get(`/api/leads/${id}`);
// export const createLead = (input) => http.post("/api/leads", input);
// export const updateLead = (id, patch) => http.patch(`/api/leads/${id}`, patch);
// export const deleteLead = (id) => http.del(`/api/leads/${id}`);
// export const importLeads = async (rows) => (await http.post("/api/leads/import", { rows })).count;
// export const exportLeads = () => http.get("/api/leads/export");
// export const convertLead = (id, service_name, contract_value) =>
//   http.post(`/api/leads/${id}/convert`, { service_name: service_name ?? null, contract_value: contract_value ?? null });

// // ---------------- Clients ----------------
// export const getClients = (f = {}) => http.get("/api/clients", f);
// export const getClient = (id) => http.get(`/api/clients/${id}`);
// export const updateClient = (id, patch) => { const { assignee: _a, ...rest } = patch; return http.patch(`/api/clients/${id}`, rest); };
// export const createClientRecord = (input) => http.post("/api/clients", input);
// export const deleteClient = (id) => http.del(`/api/clients/${id}`);

// // ---------------- Follow-ups / reminders / meetings ----------------
// /** f: { scope: upcoming|overdue|today|done|all, lead_id, client_id, type } */
// export const getFollowUps = (f = {}) => http.get("/api/follow-ups", f);
// export const createFollowUp = (input) => http.post("/api/follow-ups", input);
// export const updateFollowUp = (id, patch) => { const { lead: _l, client: _c, assignee: _a, ...rest } = patch; return http.patch(`/api/follow-ups/${id}`, rest); };
// export const deleteFollowUp = (id) => http.del(`/api/follow-ups/${id}`);

// // ---------------- Tasks ----------------
// export const getTasks = (f = {}) => http.get("/api/tasks", f);
// export const createTask = (input) => http.post("/api/tasks", input);
// export const updateTask = (id, patch) => { const { lead: _l, client: _c, assignee: _a, ...rest } = patch; return http.patch(`/api/tasks/${id}`, rest); };
// export const deleteTask = (id) => http.del(`/api/tasks/${id}`);

// // ---------------- Activities ----------------
// export const getActivities = (f) => http.get("/api/activities", f);
// export const addActivity = (input) => http.post("/api/activities", input);

// // ---------------- Documents ----------------
// export const getDocuments = (f) => http.get("/api/documents", f);
// export async function uploadDocument(kind, recordId, file) {
//   const form = new FormData();
//   form.append("file", file, file.name);
//   return http.upload("/api/documents", form, { kind, record_id: recordId });
// }
// /** Short-lived signed link that opens the file in a new tab. */
// export const getDocumentUrl = async (docId) => (await http.get(`/api/documents/${docId}/url`)).url;
// export const deleteDocument = (doc) => http.del(`/api/documents/${doc.id}`);

// // ---------------- Payments ----------------
// export const getPayments = (client_id) => http.get("/api/payments", { client_id });
// export const createPayment = (input) => http.post("/api/payments", input);
// export const updatePayment = (id, patch) => http.patch(`/api/payments/${id}`, patch);
// export const deletePayment = (id) => http.del(`/api/payments/${id}`);

// // ---------------- Home counters ----------------
// export const getModuleCounts = () => http.get("/api/module-counts");

// // ---------------- To-do ----------------
// export const getTodos = () => http.get("/api/todos");
// export const createTodo = (input) => http.post("/api/todos", input);
// export const updateTodo = (id, patch) => http.patch(`/api/todos/${id}`, patch);
// export const deleteTodo = (id) => http.del(`/api/todos/${id}`);

// // ---------------- Notes ----------------
// export const getNotes = (f = {}) => http.get("/api/notes", f);
// export const createNote = (input) => { const { lead: _l, client: _c, owner: _o, ...rest } = input; return http.post("/api/notes", rest); };
// export const updateNote = (id, patch) => { const { lead: _l, client: _c, owner: _o, ...rest } = patch; return http.patch(`/api/notes/${id}`, rest); };
// export const deleteNote = (id) => http.del(`/api/notes/${id}`);

// // ---------------- Chat ----------------
// export const getChannels = () => http.get("/api/chat/channels");
// export const getMessages = (channel_id, before) => http.get(`/api/chat/channels/${channel_id}/messages`, { before });
// export const sendMessage = (channel_id, body, ref) => http.post(`/api/chat/channels/${channel_id}/messages`, { body, ...ref });
// export const markChannelRead = (channel_id) => request("POST", `/api/chat/channels/${channel_id}/read`, { body: {} }).catch(() => {});
// export const openDirectChannel = async (other) => (await http.post("/api/chat/direct", { user_id: other })).id;
// export const createGroupChannel = async (name, memberIds) => (await http.post("/api/chat/groups", { name, member_ids: memberIds })).id;

// // ---------------- Calendar ----------------
// export const getCalendarEvents = (from, to) => http.get("/api/calendar", { from: from.toISOString(), to: to.toISOString() });

// // ---------------- Integrations (super admin) ----------------
// export const getIntegrations = () => http.get("/api/integrations");
// export const createIntegration = (input) => http.post("/api/integrations", input);
// export const updateIntegration = (id, patch) => http.patch(`/api/integrations/${id}`, patch);
// export const deleteIntegration = (id) => http.del(`/api/integrations/${id}`);
// export const getIntegrationEvents = (integration_id) => http.get(`/api/integrations/${integration_id}/events`);
// export const randomKey = (prefix) => prefix + Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");

// // ---------------- Account ----------------
// export const login = (email, password) => http.post("/api/auth/login", { email, password });
// export const getMe = () => http.get("/api/auth/me");
// export const changePassword = (current_password, password) => http.post("/api/auth/password", { current_password, password });
// /** Admin sets a new password for a team member (they are signed out everywhere). */
// export const resetUserPassword = (id, password) => http.post(`/api/profiles/${id}/password`, { password });
// export const requestPasswordReset = (email) => http.post("/api/auth/forgot", { email });
// export const resetPassword = (token, password) => http.post("/api/auth/reset", { token, password });

import { http, request } from "./http";

// ---------------- Dashboard ----------------
export const getDashboardStats = (days = 30) =>
  http.get("/api/dashboard", { days });
export const getEmployeePerformance = () =>
  http.get("/api/employee-performance");

// ---------------- Departments & profiles ----------------
export const getDepartments = () => http.get("/api/departments");
export const createDepartment = (name) =>
  http.post("/api/departments", { name });
export const getProfiles = () => http.get("/api/profiles");
export const updateProfile = (id, patch) =>
  http.patch(`/api/profiles/${id}`, patch);
/** input: { email, password, full_name, phone, role, department_id } */
export const createEmployee = (input) => http.post("/api/profiles", input);

// ---------------- Leads ----------------
/** f: { search, status, source, assigned_to, sort, dir, page, pageSize } -> { rows, count } */
export const getLeads = (f = {}) => http.get("/api/leads", f);
export const getLead = (id) => http.get(`/api/leads/${id}`);
export const createLead = (input) => http.post("/api/leads", input);
export const updateLead = (id, patch) => http.patch(`/api/leads/${id}`, patch);
export const deleteLead = (id) => http.del(`/api/leads/${id}`);
export const importLeads = async (rows) =>
  (await http.post("/api/leads/import", { rows })).count;
export const exportLeads = () => http.get("/api/leads/export");
export const convertLead = (id, service_name, contract_value) =>
  http.post(`/api/leads/${id}/convert`, {
    service_name: service_name ?? null,
    contract_value: contract_value ?? null,
  });

// ---------------- Clients ----------------
export const getClients = (f = {}) => http.get("/api/clients", f);
export const getClient = (id) => http.get(`/api/clients/${id}`);
export const updateClient = (id, patch) => {
  const { assignee: _a, ...rest } = patch;
  return http.patch(`/api/clients/${id}`, rest);
};
export const createClientRecord = (input) => http.post("/api/clients", input);
export const deleteClient = (id) => http.del(`/api/clients/${id}`);

// ---------------- Follow-ups / reminders / meetings ----------------
/** f: { scope: upcoming|overdue|today|done|all, lead_id, client_id, type } */
export const getFollowUps = (f = {}) => http.get("/api/follow-ups", f);
export const createFollowUp = (input) => http.post("/api/follow-ups", input);
export const updateFollowUp = (id, patch) => {
  const { lead: _l, client: _c, assignee: _a, ...rest } = patch;
  return http.patch(`/api/follow-ups/${id}`, rest);
};
export const deleteFollowUp = (id) => http.del(`/api/follow-ups/${id}`);

// ---------------- Tasks ----------------
export const getTasks = (f = {}) => http.get("/api/tasks", f);
export const createTask = (input) => http.post("/api/tasks", input);
export const updateTask = (id, patch) => {
  const { lead: _l, client: _c, assignee: _a, ...rest } = patch;
  return http.patch(`/api/tasks/${id}`, rest);
};
export const deleteTask = (id) => http.del(`/api/tasks/${id}`);

// ---------------- Activities ----------------
export const getActivities = (f) => http.get("/api/activities", f);
export const addActivity = (input) => http.post("/api/activities", input);

// ---------------- Documents ----------------
export const getDocuments = (f) => http.get("/api/documents", f);
export async function uploadDocument(kind, recordId, file) {
  const form = new FormData();
  form.append("file", file, file.name);
  return http.upload("/api/documents", form, { kind, record_id: recordId });
}
/** Short-lived signed link that opens the file in a new tab. */
export const getDocumentUrl = async (docId) =>
  (await http.get(`/api/documents/${docId}/url`)).url;
export const deleteDocument = (doc) => http.del(`/api/documents/${doc.id}`);

// ---------------- Payments ----------------
export const getPayments = (client_id) =>
  http.get("/api/payments", { client_id });
export const createPayment = (input) => http.post("/api/payments", input);
export const updatePayment = (id, patch) =>
  http.patch(`/api/payments/${id}`, patch);
export const deletePayment = (id) => http.del(`/api/payments/${id}`);

// ---------------- Home counters ----------------
export const getModuleCounts = () => http.get("/api/module-counts");

// ---------------- To-do ----------------
export const getTodos = () => http.get("/api/todos");
export const createTodo = (input) => http.post("/api/todos", input);
export const updateTodo = (id, patch) => http.patch(`/api/todos/${id}`, patch);
export const deleteTodo = (id) => http.del(`/api/todos/${id}`);

// ---------------- Notes ----------------
export const getNotes = (f = {}) => http.get("/api/notes", f);
export const createNote = (input) => {
  const { lead: _l, client: _c, owner: _o, ...rest } = input;
  return http.post("/api/notes", rest);
};
export const updateNote = (id, patch) => {
  const { lead: _l, client: _c, owner: _o, ...rest } = patch;
  return http.patch(`/api/notes/${id}`, rest);
};
export const deleteNote = (id) => http.del(`/api/notes/${id}`);

// ---------------- Chat ----------------
export const getChannels = () => http.get("/api/chat/channels");
export const getMessages = (channel_id, before) =>
  http.get(`/api/chat/channels/${channel_id}/messages`, { before });
export const sendMessage = (channel_id, body, ref) =>
  http.post(`/api/chat/channels/${channel_id}/messages`, { body, ...ref });
export const markChannelRead = (channel_id) =>
  request("POST", `/api/chat/channels/${channel_id}/read`, { body: {} }).catch(
    () => {},
  );
export const openDirectChannel = async (other) =>
  (await http.post("/api/chat/direct", { user_id: other })).id;
export const createGroupChannel = async (name, memberIds) =>
  (await http.post("/api/chat/groups", { name, member_ids: memberIds })).id;
export const deleteMessage = (id) => http.del(`/api/chat/messages/${id}`);
/** Everyone you can message (all departments). Falls back to the team list on an older server. */
export async function getChatPeople() {
  try {
    return await http.get("/api/chat/people");
  } catch (e) {
    if (e.status === 404) return http.get("/api/profiles");
    throw e;
  }
}

// ---------------- Calendar ----------------
export const getCalendarEvents = (from, to) =>
  http.get("/api/calendar", { from: from.toISOString(), to: to.toISOString() });

// ---------------- Integrations (super admin) ----------------
export const getIntegrations = () => http.get("/api/integrations");
export const createIntegration = (input) =>
  http.post("/api/integrations", input);
export const updateIntegration = (id, patch) =>
  http.patch(`/api/integrations/${id}`, patch);
export const deleteIntegration = (id) => http.del(`/api/integrations/${id}`);
export const getIntegrationEvents = (integration_id) =>
  http.get(`/api/integrations/${integration_id}/events`);
export const randomKey = (prefix) =>
  prefix +
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

// ---------------- Account ----------------
export const login = (email, password) =>
  http.post("/api/auth/login", { email, password });
export const getMe = () => http.get("/api/auth/me");
export const changePassword = (current_password, password) =>
  http.post("/api/auth/password", { current_password, password });
/** Admin sets a new password for a team member (they are signed out everywhere). */
export const resetUserPassword = (id, password) =>
  http.post(`/api/profiles/${id}/password`, { password });
export const requestPasswordReset = (email) =>
  http.post("/api/auth/forgot", { email });
export const resetPassword = (token, password) =>
  http.post("/api/auth/reset", { token, password });
