package plugins

import (
	"encoding/json"
	"net/http"

	"golang.org/x/exp/slog"
)

var registry = make(map[string]PluginTemplate)

type PluginDescription struct {
	Name         string
	Description  string
	ConfigSchema json.RawMessage
}

type PluginTemplate interface {
	Description() *PluginDescription
	Instance(config interface{}) (Plugin, error)
}

type Result struct {
	Status int    `json:"status"`
	Info   string `json:"info"` // info can be used for error messages, url for redirects etc.
}

type Plugin interface {
	Execute(http.ResponseWriter, *http.Request) *Result
}

func register(key string, c PluginTemplate) {
	if _, ok := registry[key]; ok {
		slog.Error("has already been added to the registry", "plugins.Template", key)
		return
	}
	registry[key] = c
}
