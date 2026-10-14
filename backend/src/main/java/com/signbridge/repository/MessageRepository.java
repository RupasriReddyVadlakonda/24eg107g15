package com.signbridge.repository;

import com.signbridge.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findTop100ByOrderByCreatedAtAsc();
}
