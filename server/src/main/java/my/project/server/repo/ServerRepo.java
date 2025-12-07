package my.project.server.repo;

import my.project.server.model.Server;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServerRepo extends JpaRepository<Server, Long> {
    Optional<Server> findServerByIpAddress(String ipAddress);
}
