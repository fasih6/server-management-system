package my.project.server.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import my.project.server.enums.Status;
import my.project.server.model.Server;
import my.project.server.repo.ServerRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.util.Collection;
import java.util.Optional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServerService{
    private final ServerRepo serverRepo;

    @Override
    public Server createServer(Server server) {
        log.info("Creating a new server: {}", server.getName());
        server.setImageUrl(setServerImageUrl());
        return serverRepo.save(server);
    }

    private String setServerImageUrl() {
        return "/images/server.png";
    }

    @Override
    public Server pingServer(String ipAddress) throws IOException {
        log.info("Pinging server: {}", ipAddress);
        Server server = serverRepo.findServerByIpAddress(ipAddress)
                .orElseThrow(() -> new RuntimeException("Server not found"));
        InetAddress inetAddress = InetAddress.getByName(ipAddress);
        server.setStatus(inetAddress.isReachable(10000) ? Status.SERVER_UP : Status.SERVER_DOWN);
        server.setImageUrl("http://localhost:8080/images/server.png");
        serverRepo.save(server);
        return server;
    }

    @Override
    public Collection<Server> getAllServers(int limit) {
        log.info("Fetching all servers");
        return serverRepo.findAll(PageRequest.of(0, limit)).toList();
    }

    @Override
    public Optional<Server> getServerById(Long id) {
        log.info("Fetching server by id: {}", id);
        return serverRepo.findById(id);
    }

    @Override
    public Optional<Server> updateServer(Server server) {
        log.info("Updating server: {}", server.getName());
        return Optional.of(serverRepo.save(server));
    }

    @Override
    public Boolean deleteServer(Long id) {
        log.info("Deleting server by id: {}", id);
        serverRepo.deleteById(id);
        return true;
    }
}
