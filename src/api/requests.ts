const API_BASE = 'http://localhost:8000';

const getAuthHeader = () => {
	const token = localStorage.getItem('token');
	console.log('Token from localStorage:', token); // Debug: check if token exists
	// Try 'Token' instead of 'Bearer' if your backend expects it
	return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const requests = {
	async get(endpoint: string) {
		const headers = getAuthHeader();
		console.log('Request headers:', headers); // Debug: check headers being sent
		const res = await fetch(`${API_BASE}${endpoint}`, { headers });
		if (!res.ok) throw new Error(`${res.status}`);
		return res.json();
	},
	async post(endpoint: string, data: any) {
		const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
		const res = await fetch(`${API_BASE}${endpoint}`, {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`${res.status}`);
		return res.json();
	},
};

export default requests;
