import api from "../api/axios";

// =========================================================
// GET ALL MEMBERS
// =========================================================

export const getMembers = () =>
  api.get("/members");

// =========================================================
// GET MEMBER BY DATABASE ID
//
// Example:
// GET /api/members/15
// =========================================================

export const getMemberById = (id) =>
  api.get(`/members/${id}`);

// =========================================================
// GET MEMBER BY CUSTOMER ID
//
// Example:
// GET /api/members/customer/LN001
// =========================================================

export const getMemberByCustomerId = (
  customerId
) =>
  api.get(
    `/members/customer/${encodeURIComponent(
      customerId
    )}`
  );

// =========================================================
// GET CUSTOMER DOCUMENT
// =========================================================

export const getCustomerDocument = (
  customerId
) =>
  api.get(
    `/members/customer/${encodeURIComponent(
      customerId
    )}/document`,
    {
      responseType: "blob",
    }
  );

// =========================================================
// CREATE MEMBER
// =========================================================

export const createMember = (
  member
) =>
  api.post(
    "/members",
    member
  );

// =========================================================
// UPDATE MEMBER
//
// id = DATABASE MEMBER ID
// =========================================================

export const updateMember = (
  id,
  member
) =>
  api.put(
    `/members/${id}`,
    member
  );

// =========================================================
// DELETE MEMBER
//
// id = DATABASE MEMBER ID
// =========================================================

export const deleteMember = (
  id
) =>
  api.delete(
    `/members/${id}`
  );