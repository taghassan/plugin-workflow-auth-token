/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */
import { Processor, Instruction, FlowNodeModel } from '@nocobase/plugin-workflow';
/**
 * Generate a NocoBase auth token for a given user.
 * Registers the token in the apiKeys table (same as API Keys plugin),
 * so it can be managed and revoked from the admin panel.
 */
export default class SignTokenInstruction extends Instruction {
    run(node: FlowNodeModel, prevJob: any, processor: Processor): Promise<{
        result: {
            token: string;
            userId: any;
            roleName: string;
            expiresIn: string;
            error?: undefined;
        };
        status: 1;
    } | {
        result: {
            error: any;
            token?: undefined;
            userId?: undefined;
            roleName?: undefined;
            expiresIn?: undefined;
        };
        status: -2;
    }>;
    test(config: any): Promise<{
        result: {
            token: string;
            userId: any;
            roleName: string;
            expiresIn: string;
            error?: undefined;
        };
        status: 1;
    } | {
        result: {
            error: any;
            token?: undefined;
            userId?: undefined;
            roleName?: undefined;
            expiresIn?: undefined;
        };
        status: -2;
    }>;
    private signToken;
}
