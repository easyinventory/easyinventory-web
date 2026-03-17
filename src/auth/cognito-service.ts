import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

export interface NewPasswordRequiredResult {
  type: "newPasswordRequired";
  cognitoUser: CognitoUser;
}

export interface AuthenticatedSessionResult {
  type: "success";
  session: CognitoUserSession;
}

export type AuthenticateUserResult =
  | NewPasswordRequiredResult
  | AuthenticatedSessionResult;

export function createUserPool(): CognitoUserPool {
  return new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  });
}

const userPool = createUserPool();

function createCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: userPool,
  });
}

export function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticateUserResult> {
  const cognitoUser = createCognitoUser(email);
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve({ type: "success", session });
      },
      onFailure: (err: Error) => {
        reject(err);
      },
      newPasswordRequired: () => {
        resolve({ type: "newPasswordRequired", cognitoUser });
      },
    });
  });
}

export function completeNewPasswordChallenge(
  cognitoUser: CognitoUser,
  newPassword: string
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (session: CognitoUserSession) => {
        resolve(session);
      },
      onFailure: (err: Error) => {
        reject(err);
      },
    });
  });
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  const cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }

        resolve(session);
      }
    );
  });
}

export function signOut(): void {
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

export function forgotPassword(email: string): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err: Error) => {
        reject(err);
      },
      inputVerificationCode: () => {
        resolve();
      },
    });
  });
}

export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err: Error) => {
        reject(err);
      },
    });
  });
}