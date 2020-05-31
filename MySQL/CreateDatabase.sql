create table data_table
(
  id   int auto_increment,
  data float default '0' null,
  moteMacAddr text COLLATE utf8mb4_general_ci,
  datetime datetime default CURRENT_TIMESTAMP null,
  constraint data_table_id_uindex
  unique (id)
);

create table data_hours_table
(
  id   int auto_increment,
  data float default '0' null,
  moteMacAddr text COLLATE utf8mb4_general_ci,
  datetime datetime default CURRENT_TIMESTAMP null,
  constraint data_table_id_uindex
  unique (id)
);

create table data_days_table
(
  id   int auto_increment,
  data float default '0' null,
  moteMacAddr text COLLATE utf8mb4_general_ci,
  datetime datetime default CURRENT_TIMESTAMP null,
  constraint data_table_id_uindex
  unique (id)
);

create table data_months_table
(
  id   int auto_increment,
  data float default '0' null,
  moteMacAddr text COLLATE utf8mb4_general_ci,
  datetime datetime default CURRENT_TIMESTAMP null,
  constraint data_table_id_uindex
  unique (id)
);

create table data_years_table
(
  id   int auto_increment,
  data float default '0' null,
  moteMacAddr text COLLATE utf8mb4_general_ci,
  datetime datetime default CURRENT_TIMESTAMP null,
  constraint data_table_id_uindex
  unique (id)
);

alter table data_table add primary key (id);
alter table data_hours_table add primary key (id);
alter table data_days_table add primary key (id);
alter table data_months_table add primary key (id);
alter table data_years_table add primary key (id);