DROP TABLE IF EXISTS cables;
DROP TABLE IF EXISTS prospects;
DROP TABLE IF EXISTS boxes;

CREATE TABLE boxes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project VARCHAR(36),
  name VARCHAR(100) NOT NULL,
  kind ENUM('Box','Building','Property','Pop', 'Splitter', 'Nap') NOT NULL,
  coords JSON NOT NULL,
  external_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_boxes_external_id (external_id),
  INDEX idx_boxes_project (project),
  INDEX idx_boxes_kind (kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prospects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(100),
  name VARCHAR(100),
  address VARCHAR(255),
  external_id VARCHAR(36),
  box_id BIGINT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_prospects_external_id (external_id),
  INDEX idx_prospects_box_id (box_id),
  CONSTRAINT fk_prospects_box
    FOREIGN KEY (box_id) REFERENCES boxes(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cables (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  external_id VARCHAR(36) NOT NULL,
  cable_type VARCHAR(100) NOT NULL,
  box_id BIGINT UNSIGNED,
  project VARCHAR(36),
  box_a VARCHAR(8),
  box_b VARCHAR(8),
  poles JSON,
  prospects_id BIGINT UNSIGNED,
  length DECIMAL(10,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
  PRIMARY KEY (id),
  UNIQUE KEY ux_cables_type_external (cable_type, external_id),
  INDEX idx_cables_box_id (box_id),
  INDEX idx_cables_project (project),
  CONSTRAINT fk_cables_box
    FOREIGN KEY (box_id) REFERENCES boxes(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_cables_prospect
    FOREIGN KEY (prospects_id) REFERENCES prospects(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
