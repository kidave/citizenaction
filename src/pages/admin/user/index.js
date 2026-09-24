import Head from "next/head";

import AdminUserList from "@/components/admin/user/AdminUserList";

export default function AdminUsersPage() {
  return (
    <>
      <Head><title>Users — Administration</title></Head>
      <AdminUserList />
    </>
  );
}
