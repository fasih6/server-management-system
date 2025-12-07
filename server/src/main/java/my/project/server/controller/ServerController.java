package my.project.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import my.project.server.enums.Status;
import my.project.server.model.Response;
import my.project.server.model.Server;
import my.project.server.service.ServiceServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/server")
public class ServerController {
    private final ServiceServiceImpl serverService;

    @GetMapping("/list")
    public ResponseEntity<Response> getServer(){
        return ResponseEntity.ok(Response.builder()
                .timestamp(LocalDateTime.now())
                .data(Map.of("servers", serverService.getAllServers(10)))
                .statusCode(HttpStatus.OK.value())
                .status(HttpStatus.OK)
                .message("Server fetched successfully")
                .build());
    }

    @GetMapping("/ping/{ipAddress}")
    public ResponseEntity<Response> pingServer(@PathVariable String ipAddress) throws IOException {
        Server server = serverService.pingServer(ipAddress);
        return ResponseEntity.ok(Response.builder()
                .timestamp(LocalDateTime.now())
                .data(Map.of("server", server))
                .statusCode(HttpStatus.OK.value())
                .status(HttpStatus.OK)
                .message(server.getStatus() == Status.SERVER_UP ? "Ping success" : "Ping failed")
                .build());

    }

    @PostMapping("/save")
    public ResponseEntity<Response> saveServers(@RequestBody @Valid Server server){
        Server savedServer = serverService.createServer(server);
        savedServer.setImageUrl("http://localhost:8080/images/server.png");
        return ResponseEntity.ok(Response.builder()
                .timestamp(LocalDateTime.now())
                .data(Map.of("server", savedServer))
                .statusCode(HttpStatus.CREATED.value())
                .status(HttpStatus.CREATED)
                .message("Server saved successfully")
                .build());

    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Response> getServerById(@PathVariable Long id){
        return ResponseEntity.ok(Response.builder()
                .timestamp(LocalDateTime.now())
                .data(Map.of("server", serverService.getServerById(id)))
                .statusCode(HttpStatus.OK.value())
                .status(HttpStatus.OK)
                .message("Server fetched successfully")
                .build());

    }

    @PutMapping("/update")
    public ResponseEntity<Response> updateServer(@RequestBody Server server) {
        Optional<Server> updatedServer = serverService.updateServer(server);

        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(LocalDateTime.now())
                        .data(Map.of("server", updatedServer))
                        .status(HttpStatus.OK)
                        .statusCode(HttpStatus.OK.value())
                        .message("Server updated successfully")
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deleteServer(@PathVariable Long id){
        return ResponseEntity.ok(Response.builder()
                .timestamp(LocalDateTime.now())
                .data(Map.of("server", serverService.deleteServer(id)))
                .statusCode(HttpStatus.OK.value())
                .status(HttpStatus.OK)
                .message("Server deleted successfully")
                .build());

    }

}
