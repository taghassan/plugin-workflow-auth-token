/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */
import React from 'react';
import { Instruction, WorkflowVariableInput, WorkflowVariableWrapper } from '@nocobase/plugin-workflow/client';
export default class extends Instruction {
    title: string;
    type: string;
    group: string;
    description: string;
    icon: React.JSX.Element;
    fieldset: {
        userId: {
            type: string;
            title: string;
            description: string;
            'x-decorator': string;
            'x-component': string;
            'x-component-props': {
                nullable: boolean;
                changeOnSelect: boolean;
                variableOptions: {
                    types: ((field: any) => boolean)[];
                };
                render(props: any): React.JSX.Element;
            };
            required: boolean;
            default: any;
        };
        roleName: {
            type: string;
            title: string;
            description: string;
            'x-decorator': string;
            'x-component': string;
            'x-component-props': {
                nullable: boolean;
                changeOnSelect: boolean;
                variableOptions: {
                    types: ((field: any) => boolean)[];
                };
                render(props: any): React.JSX.Element;
            };
            default: any;
        };
        expiresIn: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            enum: {
                label: string;
                value: string;
            }[];
            default: string;
        };
    };
    components: {
        WorkflowVariableInput: typeof WorkflowVariableInput;
        WorkflowVariableWrapper: typeof WorkflowVariableWrapper;
        RemoteSelect: React.FunctionComponent<Partial<import("antd").SelectProps<any, any> & {
            objectValue?: boolean;
            onChange?: (v: any) => void;
            multiple: boolean;
            rawOptions: any[];
            fieldNames?: import("@nocobase/client").FieldNames;
        } & {
            onChange?: (v: any) => void;
            wait?: number;
            manual?: boolean;
            targetField?: any;
            service: import("@nocobase/client").ResourceActionOptions<any> & {
                defaultParams?: any;
            };
            target: string;
            mapOptions?: (data: any) => import("rc-select/lib/Select").FieldNames & import("@nocobase/client").FieldNames;
            dataSource?: string;
            CustomDropdownRender?: (v: any) => any;
            optionFilter?: (option: any) => boolean;
            toOptionsItem?: (data: any) => any;
            onSuccess?: (data: any) => any;
        }> & React.RefAttributes<unknown>> & {
            ReadPretty: React.MemoExoticComponent<import("@formily/reactive-react").ReactFC<import("@nocobase/client/es/schema-component/antd/remote-select/ReadPretty").RemoteSelectReadPrettyProps>>;
        };
    };
    useVariables({ key, title }: {
        key: any;
        title: any;
    }): {
        value: any;
        label: any;
        children: {
            value: string;
            label: string;
        }[];
    };
    testable: boolean;
}
