/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { injectable } from '@cloudbeaver/core-di';
import { NotificationService } from '@cloudbeaver/core-events';
import {
  GraphQLService,
  SqlExecuteInfo,
  SqlDataFilter,
  SqlDataFilterConstraint,
} from '@cloudbeaver/core-sdk';
import { IRequestDataResult, RowDiff } from '@cloudbeaver/plugin-data-viewer';

import { ISqlQueryParams } from '../ISqlEditorTabState';
import { SQLQueryExecutionProcess } from './SQLQueryExecutionProcess';

@injectable()
export class SqlResultService {

  constructor(private graphQLService: GraphQLService,
              private notificationService: NotificationService) { }

  /**
   * @deprecated use asyncSqlQuery
   */
  async fetchData(
    sqlQueryParams: ISqlQueryParams,
    rowOffset: number,
    count: number,
    constraints?: SqlDataFilterConstraint[]
  ): Promise<SqlExecuteInfo> {
    const response = await this.graphQLService.gql.executeSqlQuery({
      connectionId: sqlQueryParams.connectionId,
      contextId: sqlQueryParams.contextId,
      query: sqlQueryParams.query,

      filter: {
        offset: rowOffset,
        limit: count,
        constraints,
      },
    });
    return response.result!;
  }

  asyncSqlQuery(
    sqlQueryParams: ISqlQueryParams,
    filter: SqlDataFilter
  ): SQLQueryExecutionProcess {

    const cancellableSqlQuery = new SQLQueryExecutionProcess(this.graphQLService, this.notificationService);
    cancellableSqlQuery.start(sqlQueryParams, filter);
    return cancellableSqlQuery;
  }

  async saveChanges(
    sqlQueryParams: ISqlQueryParams,
    resultId: string,
    diffs: RowDiff[]
  ): Promise<SqlExecuteInfo> {

    const firstRow = diffs[0]; // todo multiple row to be implemented later

    const response = await this.graphQLService.gql.updateResultsData({
      connectionId: sqlQueryParams.connectionId,
      contextId: sqlQueryParams.contextId,
      resultsId: resultId,
      sourceRowValues: firstRow.source,
      values: firstRow.values,
    });

    return response.result!;
  }

  sqlExecuteInfoToData(result: SqlExecuteInfo, indexInResultSet: number, count?: number): IRequestDataResult {
    const dataSet = result.results ? result.results[indexInResultSet]?.resultSet : null;
    if (!dataSet) {
      throw new Error(`Dataset with indexInResultSet ${indexInResultSet} not found`);
    }

    const dataResults: IRequestDataResult = {
      rows: dataSet.rows!,
      columns: dataSet.columns || [],
      duration: result.duration,
      statusMessage: result.statusMessage || 'Ok',
      isFullyLoaded: count !== undefined
        ? (dataSet.rows?.length || 0) < count
        : false, // case of saveChanges method, where this flag is not in use
    };
    return dataResults;
  }

}