import { z } from "zod";
import { EmploymentStatusSchema } from "@/features/employees/constants/status-options";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Field-for-field identical to the backend CreateEmployeeDto / UpdateEmployeeDto.
 * Deliberately duplicated across the language boundary and documented in
 * docs/decision-record.md: fullName, email, departmentId, jobTitle, status,
 * joiningDate.
 */
export const employeeSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .toLowerCase(),
  departmentId: z.coerce.number().int().positive("Select a department."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  status: EmploymentStatusSchema,
  joiningDate: z.string().regex(datePattern, "Select a valid joining date."),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const DEFAULT_EMPLOYEE_VALUES: EmployeeFormValues = {
  fullName: "",
  email: "",
  departmentId: NaN,
  jobTitle: "",
  status: "ACTIVE",
  joiningDate: "",
};

export function toEmployeePayload(values: EmployeeFormValues): {
  fullName: string;
  email: string;
  departmentId: number;
  jobTitle: string;
  status: "ACTIVE" | "INACTIVE";
  joiningDate: string;
} {
  return {
    fullName: values.fullName,
    email: values.email,
    departmentId: values.departmentId,
    jobTitle: values.jobTitle,
    status: values.status,
    joiningDate: values.joiningDate,
  };
}
