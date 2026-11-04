import { accountRepository } from './accountRepository';
import {
  isAccountRegistrationEmailConfigured,
  sendAccountRegistrationEmail,
} from './accountEmail';

export interface AccountRegistrationEmailDispatchResult {
  sentAccountIds: string[];
  failed: number;
}

export async function dispatchPendingAccountRegistrationEmails(
  batchSize = 10,
): Promise<AccountRegistrationEmailDispatchResult> {
  if (!isAccountRegistrationEmailConfigured()) {
    return { sentAccountIds: [], failed: 0 };
  }

  const notifications = await accountRepository.claimPendingRegistrationEmails(batchSize);
  const sentAccountIds: string[] = [];
  let failed = 0;

  for (const notification of notifications) {
    try {
      await sendAccountRegistrationEmail(notification.payload);
      await accountRepository.markRegistrationEmailSent(notification.accountId);
      sentAccountIds.push(notification.accountId);
    } catch (error) {
      failed += 1;
      const reason = error instanceof Error ? error.message : 'Unknown email delivery failure.';
      await accountRepository.markRegistrationEmailPending(notification.accountId, reason);
      console.error(`Account registration email ${notification.accountId} remains queued.`, error);
    }
  }

  return { sentAccountIds, failed };
}