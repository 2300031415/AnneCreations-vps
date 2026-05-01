import { baseApi } from './baseApi';

export interface MachineFormat {
  _id: string;
  id: string;
  name: string;
}

export const machineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMachineFormats: builder.query<MachineFormat[], void>({
      query: () => '/api/products/options',
    }),
  }),
});

export const { useGetMachineFormatsQuery } = machineApi;
