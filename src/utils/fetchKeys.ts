let plangroupsFetchKey = ['getPlanGroups', undefined];
export const setPlanGroupsFetchKey = (id: string | undefined) => {
  plangroupsFetchKey = ['getPlanGroups', id];
  return plangroupsFetchKey;
};
export const getPlanGroupsFetchKey = () => plangroupsFetchKey;
