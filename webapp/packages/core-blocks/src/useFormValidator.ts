
/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2022 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { IExecutor, IExecutorHandlersCollection } from '@cloudbeaver/core-executor';

import { useExecutor } from './useExecutor';

export function useFormValidator(
  validationTask: IExecutor<any> | IExecutorHandlersCollection<any>,
  ref: React.RefObject<HTMLFormElement>,
  callback?: () => void
): void {
  useExecutor({
    executor: validationTask,
    postHandlers: [function validate() {
      ref.current?.focus();
      ref.current?.checkValidity();
      ref.current?.reportValidity();

      callback?.();
    }],
  });
}
