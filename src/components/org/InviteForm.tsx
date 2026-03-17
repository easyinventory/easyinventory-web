import { useState } from "react";
import { inviteMember } from "../../api/orgApi";
import { OrgRole, formatRoleLabel } from "../../constants/roles";
import "./InviteForm.css";

interface InviteFormProps {
  actorRole: string;
  onInvited: () => void;
}

export default function InviteForm({ actorRole, onInvited }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>(OrgRole.EMPLOYEE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = actorRole === OrgRole.OWNER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await inviteMember({ email, org_role: role });
      setSuccess(`Invited ${email} as ${formatRoleLabel(role)}`);
      setEmail("");
      setRole(OrgRole.EMPLOYEE);
      onInvited();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      if (
        typeof err === "object" && err !== null && "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const axiosErr = err as { response: { data: { detail: string } } };
        setError(axiosErr.response.data.detail);
      } else {
        setError("Failed to send invite. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="invite-form">
      <div className="invite-form__title">Invite a team member</div>
      <form onSubmit={handleSubmit}>
        <div className="invite-form__row">
          <div className="invite-form__field">
            <label htmlFor="invite-email">Email</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
            />
          </div>
          <div className="invite-form__field invite-form__field--role">
            <label htmlFor="invite-role">Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
            >
              <option value={OrgRole.EMPLOYEE}>Employee</option>
              <option value={OrgRole.VIEWER}>Viewer</option>
              {isOwner && <option value={OrgRole.ADMIN}>Admin</option>}
            </select>
          </div>
          <button
            type="submit"
            className="invite-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send invite"}
          </button>
        </div>
        <p className="invite-form__hint">
          They'll get access when they sign up with this email.
        </p>
        {error && <div className="invite-form__error">{error}</div>}
        {success && <div className="invite-form__success">{success}</div>}
      </form>
    </div>
  );
}
