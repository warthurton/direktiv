FROM golang:1.21 as builder

ARG RELEASE_VERSION
ENV RELEASE=$RELEASE_VERSION

COPY go.mod src/go.mod
COPY go.sum src/go.sum
RUN cd src/ && go mod download

COPY pkg src/pkg/
COPY cmd src/cmd/
COPY .git .git

RUN --mount=type=cache,target=/root/.cache/go-build cd src && \
    export GIT_HASH=`git rev-parse --short HEAD` && \
    export FULL_VERSION="${RELEASE:-$GIT_HASH}"; echo "${v%.*}" && \
    CGO_ENABLED=false go build -tags osusergo,netgo -ldflags "-X github.com/direktiv/direktiv/pkg/version.Version=$FULL_VERSION" -o /direktiv cmd/direktiv/*.go;

FROM golang:1.21 as builder-cmd

COPY cmd/cmd-exec/go.mod src/go.mod
COPY cmd/cmd-exec/go.sum src/go.sum
RUN cd src/ && go mod download

COPY cmd/cmd-exec/pkg src/pkg
COPY cmd/cmd-exec/main.go src


RUN --mount=type=cache,target=/root/.cache/go-build cd src && \
    CGO_ENABLED=false go build -tags osusergo,netgo -o /direktiv-cmd main.go;    

FROM ubuntu:22.04

RUN apt-get update && apt-get install git -y

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /direktiv /bin/direktiv
COPY --from=builder-cmd /direktiv-cmd /bin/direktiv-cmd

CMD ["/bin/direktiv"]