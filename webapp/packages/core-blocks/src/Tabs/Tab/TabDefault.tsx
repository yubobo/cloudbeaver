/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import styled from 'reshadow';

import { Translate } from '@cloudbeaver/core-localization';
import { DynamicStyle, useStyles } from '@cloudbeaver/core-theming';

import { ITabData } from '../TabsContext';
import { Tab } from './Tab';
import { TabIcon } from './TabIcon';
import { TabProps } from './TabProps';
import { TabTitle } from './TabTitle';

interface Props<T = Record<string, any>> {
  tabId: string;
  icon?: string;
  name?: string;
  component?: React.FC<TabProps & T>;
  className?: string;
  style?: DynamicStyle[] | DynamicStyle;
  disabled?: boolean;
  onOpen?: (tab: ITabData<any>) => void;
  onClose?: (tab: ITabData<any>) => void;
}

export function TabDefault<T = Record<string, any>>({
  tabId,
  icon,
  name,
  component,
  className,
  style,
  disabled,
  onOpen,
  onClose,
  ...rest
}: Props<T> & T): React.ReactElement | null {
  const styles = useStyles(style);

  if (component) {
    const TabComponent = component;
    return (
      <TabComponent
        tabId={tabId}
        className={className}
        {...(rest as unknown as T)}
        style={style}
        disabled={disabled}
        onOpen={onOpen}
        onClose={onClose}
      />
    );
  }

  return styled(styles)(
    <Tab tabId={tabId} className={className} style={style} disabled={disabled} onOpen={onOpen} onClose={onClose}>
      {icon && <TabIcon icon={icon} />}
      {name && <TabTitle><Translate token={name} /></TabTitle>}
    </Tab>
  );
}