package plugins

import (
	"fmt"
	"net/http"

	"github.com/invopop/jsonschema"
)

type exampleConfig struct {
	SomeString string `json:"somestring" jsonschema:"title=The String,description=This is the string,default=VALUE,required,minLength=1,maxLength=20"`
	SomeInt    int    `json:"someint" jsonschema:"title=The Int,description=This is the int,default=1,optional"`
}

type ExamplePlugin struct {
	config exampleConfig
}

func (p *ExamplePlugin) Execute(http.ResponseWriter, *http.Request) *Result {
	return nil
}

func (p *ExamplePlugin) Description() *PluginDescription {
	b, err := jsonschema.Reflect(&exampleConfig{}).MarshalJSON()
	if err != nil {
		panic("json schema for plugin broken")
	}

	return &PluginDescription{
		Name:         "example",
		Description:  "example plugin",
		ConfigSchema: b,
	}
}

func (p *ExamplePlugin) Instance(config interface{}) (Plugin, error) {
	c, ok := config.(exampleConfig)
	if !ok {
		return nil, fmt.Errorf("invalid configuration")
	}

	// TODO validate here

	return &ExamplePlugin{
		config: c,
	}, nil
}

func init() {
	register("example-v1", &ExamplePlugin{})
}
