export const crmGuard = async () => {
  // if (!inject(AuthService).activeUser()) {
  //   await inject(Router).navigate([`${CORE_ROUTE}/${LOGIN_ROUTE}`]);
  //   return false;
  // }
  return true;
};
