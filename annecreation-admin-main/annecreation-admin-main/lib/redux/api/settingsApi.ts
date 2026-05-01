import { baseApi } from './baseApi'

export interface Setting {
    _id?: string
    key: string
    value: any
    description?: string
    createdAt?: string
    updatedAt?: string
}

export const settingsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getSettings: builder.query<Setting[], void>({
            query: () => '/api/settings',
            transformResponse: (response: { data: Setting[] }) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ key }) => ({ type: 'Settings' as const, id: key })),
                        { type: 'Settings', id: 'LIST' },
                    ]
                    : [{ type: 'Settings', id: 'LIST' }],
        }),

        getSettingByKey: builder.query<Setting, string>({
            query: (key) => `/api/settings/${key}`,
            transformResponse: (response: { data: Setting }) => response.data,
            providesTags: (result, error, key) => [{ type: 'Settings', id: key }],
        }),

        updateSetting: builder.mutation<Setting, { key: string; value: any; description?: string }>({
            query: ({ key, ...body }) => ({
                url: `/api/settings/${key}`,
                method: 'POST',
                body,
            }),
            transformResponse: (response: { data: Setting }) => response.data,
            invalidatesTags: (result, error, { key }) => [
                { type: 'Settings', id: key },
                { type: 'Settings', id: 'LIST' },
            ],
        }),
    }),
})

export const {
    useGetSettingsQuery,
    useGetSettingByKeyQuery,
    useUpdateSettingMutation,
} = settingsApi
