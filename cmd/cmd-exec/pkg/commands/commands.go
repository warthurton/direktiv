package commands

import (
	"context"
	"fmt"
	"os"
	"os/exec"

	"github.com/direktiv/direktiv/cmd/cmd-exec/pkg/server"

	"github.com/mattn/go-shellwords"
)

type Commmand struct {
	Command         string `json:"command"`
	StopOnError     bool   `json:"stop"`
	SuppressCommand bool   `json:"suppress_command"`
	SuppressOutput  bool   `json:"suppress_output"`
}

type Commands struct {
	Commands []Commmand `json:"commands"`
}

type CommandsResponse struct {
	Error  string
	Output interface{}
}

func RunCommands(ctx context.Context, in Commands, info *server.ExecutionInfo) (interface{}, error) {

	commandOutput := make([]CommandsResponse, 0)

	info.Log.Log("running %d commands", len(in.Commands))

	for a := range in.Commands {
		command := in.Commands[a]

		// print command
		if !command.SuppressCommand {
			info.Log.Log("running command '%s'", command.Command)
		} else {
			info.Log.Log("running command %d", a)
		}

		// reset binary writer
		info.Log.LogData.Reset()

		// set up logs
		if command.SuppressOutput {
			info.Log.SetWriterState(false)
		}

		err := runCmd(command, info)

		cr := CommandsResponse{
			Output: info.Log.LogData.String(),
		}

		// enable writer again
		info.Log.SetWriterState(true)

		if err != nil {
			info.Log.Log("%s", err.Error())
			cr.Error = err.Error()

			// check if it has to stop here
			if command.StopOnError {

				commandOutput = append(commandOutput, cr)
				break
			}
		}

		commandOutput = append(commandOutput, cr)

	}

	return commandOutput, nil
}

func runCmd(command Commmand, ei *server.ExecutionInfo) error {

	p := shellwords.NewParser()
	p.ParseEnv = true
	p.ParseBacktick = true

	args, err := p.Parse(command.Command)
	if err != nil {
		return err
	}

	if len(args) == 0 {
		return fmt.Errorf("no binary provided")
	}

	// always a binary
	bin := args[0]
	argsIn := []string{}
	if len(args) > 1 {
		argsIn = args[1:]
	}

	cmd := exec.CommandContext(context.Background(), bin, argsIn...)
	cmd.Dir = ei.TmpDir
	cmd.Stdout = ei.Log
	cmd.Stderr = ei.Log

	curEnvs := append(os.Environ(), fmt.Sprintf("HOME=%s", ei.TmpDir))
	cmd.Env = curEnvs

	return cmd.Run()
}
