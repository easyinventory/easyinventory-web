import { useState, useCallback } from "react";
import { inviteMember } from "../api/orgApi";
import { OrgRole, formatRoleLabel } from "../../../shared/constants/roles";
import { useAsyncAction } from "../../../shared/hooks";
import { ErrorBanner, SuccessBanner } from "../../../shared/components/ui";
import "./InviteForm.css";

interface InviteFormProps {
  actorRole: string;
  onInvited: () => void;
}

export default function InviteForm({ actorRole, onInvited }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>(OrgRole.EMPLOYEE);

  const isOwner = actorRole === OrgRole.OWNER;

  const action = useCallback(async () => {
    await inviteMember({ email, org_role: role });
    const msg = `Invited ${email} as ${formatRoleLabel(role)}`;
    setEmail("");
    setRole(OrgRole.EMPLOYEE);
    onInvited();
    return msg;
  }, [email, role, onInvited]);

  const { execute, isLoading: isSubmitting, error, success } = useAsyncAction(action, {
    successTimeout: 4000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void execute();
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
        {error && <ErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}
      </form>
    </div>
  );
}
