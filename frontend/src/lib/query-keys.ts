export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    list: (params: object) => ['employees', 'list', params] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
  },
  departments: {
    all: ['departments'] as const,
    list: () => ['departments', 'list'] as const,
    detail: (id: number) => ['departments', 'detail', id] as const,
  },
}