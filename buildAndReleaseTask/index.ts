//    Copyright CodeMerx 2021
//    This file is part of Assembly Differ.

//    Assembly Differ is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    Assembly Differ is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//    GNU Affero General Public License for more details.

//    You should have received a copy of the GNU Affero General Public License
//    along with Assembly Differ. If not, see<https://www.gnu.org/licenses/>.

import tl = require('azure-pipelines-task-lib/task');
import { exec } from "child_process";

type callback = (result: string) => void;

const executeCommand = (command: string, callback: callback) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            tl.setResult(tl.TaskResult.Failed, error.message);
            return;
        }

        if (stderr) {
            tl.setResult(tl.TaskResult.Failed, `stderr: ${stderr}`);
            return;
        }

        try {
            callback(stdout);
        } catch (error) {
            tl.setResult(tl.TaskResult.Failed, error.message);
            throw error;
        }
    });
}

const installAssemblyDiffer = (next: callback) => {
    executeCommand('dotnet tool install -g assembly-differ', next);
}

const runAssemblyDiffer = (args: string) => {
    executeCommand(`assembly-differ ${args}`, (stdout: string) => {
        console.log(`stdout: ${stdout}`);
    });
}

const main = () => {
    try {
        const args: string | undefined = tl.getInput('args', true);
        if (!args) {
            tl.setResult(tl.TaskResult.Failed, 'No args passed');
            return;
        }

        installAssemblyDiffer(() => {
            runAssemblyDiffer(args);
        });
    } catch (error) {
        tl.setResult(tl.TaskResult.Failed, error.message);
    }
}

main();