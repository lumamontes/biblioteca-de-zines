# Go architecture references: dependency injection, composition roots, ports/adapters, and package organization

## What do official Go guidance and mature projects say about package organization?

### Takeaway

Official Go guidance favors meaningful packages, small exported surfaces, predictable import paths, and `internal` for server-only implementation. It explicitly avoids prescribing a universal directory architecture: a package, command, or server should be organized according to what it exposes and what its users need.

### Cited Findings

- Go's package naming guidance says a package name supplies context for exported identifiers, and recommends avoiding vague grab-bag names because they dilute the package's meaning — [Go Blog: Organizing Go code](https://go.dev/blog/organizing-go-code).
- The same guidance says to minimize exported interfaces because every exported declaration becomes part of the support contract, and it recommends splitting packages when there is a coherent boundary rather than applying a fixed package-size rule — [Go Blog: Organizing Go code](https://go.dev/blog/organizing-go-code).
- Go's module-layout guidance recommends `internal` for supporting packages that should not be imported by other modules, because code inside it can be refactored without preserving an external API — [Organizing a Go module](https://go.dev/doc/modules/layout).
- For server projects, the official layout guidance recommends putting server implementation packages under `internal` and commands under `cmd`; it also says a repository can contain multiple commands with one `main` package per command — [Organizing a Go module](https://go.dev/doc/modules/layout).
- The official guidance presents `cmd` as a common convention, not a language requirement. A repository containing only commands may omit it, while a mixed repository benefits from it to distinguish commands from importable packages — [Organizing a Go module](https://go.dev/doc/modules/layout).
- Kubernetes uses domain and subsystem names in import paths such as `pkg/controlplane`, `pkg/apiserver`, `pkg/kubeapiserver/admission`, and `client-go/informers`, rather than generic `util`-style names. Its API-server app package documents itself as binding API, master, and server infrastructure — [Kubernetes API-server app package](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go).
- Grafana's package names similarly describe infrastructure or capability boundaries: `pkg/server`, `pkg/registry`, `pkg/services/<capability>`, `pkg/infra/<capability>`, `pkg/storage/<capability>`, and `pkg/api`. The generated dependency graph imports these packages directly — [Grafana generated Wire graph](https://github.com/grafana/grafana/blob/main/pkg/server/bootstrap/wire/wire_gen.go).

### Inferences

- Across the sources, directory names are secondary to package contracts. `internal`, `cmd`, `services`, `registry`, and `infra` are useful signals, but none is a substitute for a package having a focused name and a deliberately small API.
- Mature services tend to name packages after a domain capability or technical boundary (`accesscontrol`, `storage`, `transport/http`, `registry`) and reserve `main`/command packages for process concerns.

### Gaps

- Go's official documentation does not define a formal ports-and-adapters directory convention, nor does it require `internal`, `cmd`, or a particular service-layer naming scheme. The project examples below are conventions observed in their own codebases, not Go language rules.

## Where does dependency wiring and the composition root live?

### Takeaway

The examples keep process assembly near an executable boundary, but differ in how much assembly is hand-written. Go kit uses an explicit `func main`; Kubernetes uses command setup plus `app.Run`, `NewConfig`, and `CreateServerChain`; Grafana delegates the graph to generated Wire code in a dedicated bootstrap subpackage and passes the generated initializer into startup orchestration.

### Cited Findings

- Go kit explicitly recommends wiring the complete component graph in `func main`, keeping component lifecycles there and passing dependencies through constructors instead of using global state or a service locator — [Go kit FAQ: Dependency Injection](https://gokit.io/faq/#dependency-injection-mdash-why-is-func-main-always-so-big).
- Go kit's documented graph is deliberately visible: construct a logger, construct the concrete service, wrap it with middleware, construct endpoints from the service, and construct transport from the endpoints — [Go kit FAQ: Dependency Injection](https://gokit.io/faq/#dependency-injection-mdash-why-is-func-main-always-so-big).
- In the Go kit string-service tutorial, service definitions and transport adapters can be split into `service.go` and `transport.go`, while `main.go` remains the place where the service, middleware, endpoints, handlers, routes, and listener are assembled — [Go kit stringsvc tutorial](https://gokit.io/examples/stringsvc.html).
- Go kit treats loggers, databases, and other collaborators as constructor dependencies, and demonstrates wrapping service interfaces with middleware. This keeps the business-facing service independent of HTTP and other transport details — [Go kit FAQ: Persistence and architecture](https://gokit.io/faq/#persistence-mdash-how-should-i-work-with-databases-and-data-stores), [Go kit FAQ: Architecture and design](https://gokit.io/faq/#architecture-and-design).
- Kubernetes's `cmd/kube-apiserver/app` package is an application assembly boundary. `NewAPIServerCommand` creates options and command lifecycle behavior; `Run` calls `NewConfig`, completes it, calls `CreateServerChain`, prepares the result, and runs it — [Kubernetes API-server app package](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go).
- Kubernetes separates construction stages rather than putting every constructor in `main`: `CreateServerChain` creates the API extension server, Kubernetes API server, and aggregator in delegation order, while `CreateKubeAPIServerConfig` builds collaborators such as admission initializers, endpoint resolvers, and control-plane configuration — [Kubernetes API-server app package](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go).
- Kubernetes's package comment identifies `app` as the place that binds the API, master, and API-server infrastructure, confirming that the composition boundary is an application package rather than a low-level domain package — [Kubernetes API-server app package](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go).
- Grafana's executable entrypoint constructs CLI metadata and a `ServerDeps` value, then passes edition-specific initializers such as `server.Initialize` to the command layer. It side-effect-imports `pkg/server/bootstrap/wire` to register the generated OSS dependency-injection entrypoints — [Grafana `pkg/cmd/grafana/main.go`](https://github.com/grafana/grafana/blob/main/pkg/cmd/grafana/main.go).
- Grafana's bootstrap package is explicitly edition-neutral and describes the Wire initializer as supplied by the caller; the root bootstrap package orchestrates startup while `bootstrap/wire` owns the core graph — [Grafana bootstrap package](https://github.com/grafana/grafana/blob/main/pkg/server/bootstrap/bootstrap.go).
- Grafana's generated initializer is a long, ordered constructor graph. It invokes provider functions such as `ProvideService`, `ProvideStore`, and `ProvideHTTPServer`, passing earlier results into later providers and returning the final `server.Server` — [Grafana generated Wire graph](https://github.com/grafana/grafana/blob/main/pkg/server/bootstrap/wire/wire_gen.go).
- Grafana keeps lifecycle behavior in `pkg/server`: `server.New` accepts already-constructed collaborators, initializes the server, and `Server.Run` starts the background-service manager. This separates graph construction from runtime lifecycle — [Grafana server package](https://github.com/grafana/grafana/blob/main/pkg/server/server.go).

### Inferences

- “Composition root” is a role, not necessarily a file named `main.go`. In Go kit it is literally `main`; in Kubernetes it is the `cmd/kube-apiserver/app` assembly package; in Grafana it spans the command entrypoint, bootstrap orchestration, and generated `bootstrap/wire` graph.
- Code generation changes where a reader begins: Grafana's human-maintained boundary is the bootstrap/command API and provider declarations, while the generated file materializes the graph. The generated file is still a concrete source of truth for the assembled dependency order, but it is not the best place to express business policy.
- The examples favor explicit constructor calls and typed interfaces over runtime container lookup. The automated part in Grafana generates ordinary Go calls rather than hiding dependencies behind a runtime registry; Kubernetes similarly exposes staged constructors in application code.

### Gaps

- The inspected Kubernetes file is the API-server path, not every Kubernetes binary. Other components may use different staging functions or generated code.
- Grafana's generated file is large and evolves quickly. These notes describe the structure and named boundaries visible at the referenced `main` branch URLs; a historical checkout may differ.

## How do ports/adapters and layered boundaries appear in Go projects?

### Takeaway

Go kit is the clearest explicit ports-and-adapters example among the sources: business services are interfaces and implementations, endpoints adapt service methods, and transports bind endpoints to HTTP or gRPC. Kubernetes and Grafana use more operationally layered boundaries, with interfaces and provider packages at subsystem seams rather than a uniform “ports” directory.

### Cited Findings

- Go kit describes three layers: transport, endpoint, and service. Requests enter through transport, move through endpoints to the service, and responses return outward — [Go kit FAQ: Architecture and design](https://gokit.io/faq/#introduction-mdash-understanding-go-kit-key-concepts).
- Go kit says transports are bound to concrete protocols such as HTTP and gRPC, endpoints adapt service operations into a generic endpoint abstraction, and services contain business logic — [Go kit FAQ: Architecture and design](https://gokit.io/faq/#transports-mdash-what-are-go-kit-transports), [Go kit FAQ: Architecture and design](https://gokit.io/faq/#endpoints-mdash-what-are-go-kit-endpoints), [Go kit FAQ: Architecture and design](https://gokit.io/faq/#services-mdash-what-is-a-go-kit-service).
- Go kit explicitly says service code should have no knowledge of endpoint or transport concerns, and names Clean Architecture and Hexagonal Architecture as the intended direction — [Go kit FAQ: Architecture and design](https://gokit.io/faq/#services-mdash-what-is-a-go-kit-service).
- The string-service example defines a `StringService` interface, implements it in a concrete type, converts methods into endpoints, and passes those endpoints to `transport/http` servers. The example therefore shows the port as the service interface and the transport as an outer adapter — [Go kit stringsvc tutorial](https://gokit.io/examples/stringsvc.html).
- Go kit's persistence guidance models a business-facing `Store` interface in domain terms (`Insert(Profile)`, `Select`, `Delete`) and places the SQL handle in an implementation behind that interface — [Go kit FAQ: Persistence](https://gokit.io/faq/#persistence-mdash-how-should-i-work-with-databases-and-data-stores).
- Go kit uses middleware/decorators around service or endpoint interfaces for logging, instrumentation, rate limiting, circuit breaking, and tracing. The concern is attached at the layer that understands it — [Go kit FAQ: Middlewares](https://gokit.io/faq/#middlewares-mdash-what-are-middlewares-in-go-kit), [Go kit stringsvc tutorial](https://gokit.io/examples/stringsvc.html).
- Kubernetes expresses boundaries through subsystem packages and interfaces. The API-server app builds a service resolver through an interface (`webhook.ServiceResolver`) and chooses concrete resolver implementations based on configuration, then passes the result into control-plane construction — [Kubernetes API-server app package](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go).
- Grafana exposes interfaces for cross-cutting runtime roles such as `BackgroundServiceRegistry`, `BackgroundService`, `UsageStatsProvidersRegistry`, and `DatabaseMigrator` in `pkg/registry`; concrete services implement those contracts while `pkg/server` manages lifecycle — [Grafana registry package](https://github.com/grafana/grafana/blob/main/pkg/registry/registry.go), [Grafana server package](https://github.com/grafana/grafana/blob/main/pkg/server/server.go).
- Grafana's package tree distinguishes API, registry, service, infrastructure, storage, and transport-like concerns. The generated graph composes providers from those packages into higher-level services, rather than making the higher-level server import every low-level implementation directly at runtime — [Grafana generated Wire graph](https://github.com/grafana/grafana/blob/main/pkg/server/bootstrap/wire/wire_gen.go).

### Inferences

- Ports/adapters in Go commonly appear as interfaces located with the consuming capability, plus concrete adapters in a technical package, not necessarily as folders literally called `ports` and `adapters`.
- The most stable seam in these examples is the constructor/interface boundary: service constructors accept business-facing interfaces, transport constructors accept endpoint/service abstractions, and composition code selects concrete implementations.
- Kubernetes and Grafana demonstrate that a large service can combine several local architectures. A subsystem may use a domain interface, a registry contract, or a provider function without forcing the entire repository into one global layering vocabulary.

### Gaps

- None of the primary sources claims that “ports and adapters” is the only valid Go architecture. Go kit advocates it for its service model, while Kubernetes and Grafana document and implement broader systems with multiple local boundaries.
- Package names alone cannot establish dependency direction. Verifying direction requires reading imports and constructor signatures, especially in large generated graphs such as Grafana's.

### Comparison at a glance

| Reference | Wiring location | Wiring style | Boundary/package vocabulary | Main tradeoff |
| --- | --- | --- | --- | --- |
| Official Go guidance | Command/server boundary, with no mandated single file | Explicit packages and constructors; layout follows exposure and ownership | `internal`, `cmd`, domain-shaped package names | Flexible, but leaves architectural choices to the project — [Organizing a Go module](https://go.dev/doc/modules/layout) |
| Go kit | `func main` | Hand-written, declarative constructor graph and middleware wrapping | `service`, `endpoint`, `transport`, plus service-specific packages | Very readable and testable; `main` can become large — [Go kit DI FAQ](https://gokit.io/faq/#dependency-injection-mdash-why-is-func-main-always-so-big) |
| Kubernetes API server | `cmd/kube-apiserver/app` | Hand-written staged construction: options, config, server chain, lifecycle | `app`, `options`, `controlplane`, `apiserver`, `admission`, `informers` | Makes lifecycle stages explicit; assembly is distributed across application-level functions — [Kubernetes server app](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go) |
| Grafana | `pkg/cmd/grafana/main.go`, `pkg/server/bootstrap`, and generated `pkg/server/bootstrap/wire` | Generated provider graph with edition-specific initializer selection | `server`, `bootstrap`, `wire`, `services`, `registry`, `infra`, `storage` | Handles a very large graph and edition variants; generated output is harder to inspect/edit directly — [Grafana main](https://github.com/grafana/grafana/blob/main/pkg/cmd/grafana/main.go), [Grafana Wire graph](https://github.com/grafana/grafana/blob/main/pkg/server/bootstrap/wire/wire_gen.go) |
