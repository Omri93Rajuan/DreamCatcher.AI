const fetchMock = jest.fn(async () => ({
    ok: true,
    json: async () => ({}),
}));

export const Response = class MockResponse {};

export default fetchMock;
