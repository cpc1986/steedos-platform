
const BACKUP_PATH = "/steedos-stacks/data/backup"

const RESTORE_PATH = "/steedos-stacks/data/restore"

const DUMP_FILE_NAME = "steedos-data.archive"

const APPSMITHCTL_LOG_PATH = "/steedos-stacks/logs/appsmithctl"

const LAST_ERROR_MAIL_TS = "/steedos-stacks/data/backup/last-error-mail-ts"

const MIN_REQUIRED_DISK_SPACE_IN_BYTES = 2147483648 // 2GB

const DURATION_BETWEEN_BACKUP_ERROR_MAILS_IN_MILLI_SEC = 21600000 // 6 hrs

const STEEDOS_DEFAULT_BACKUP_ARCHIVE_LIMIT = 4 // 4 backup archives

module.exports = {
    BACKUP_PATH,
    RESTORE_PATH,
    DUMP_FILE_NAME,
    LAST_ERROR_MAIL_TS,
    APPSMITHCTL_LOG_PATH,
    MIN_REQUIRED_DISK_SPACE_IN_BYTES,
    DURATION_BETWEEN_BACKUP_ERROR_MAILS_IN_MILLI_SEC,
    STEEDOS_DEFAULT_BACKUP_ARCHIVE_LIMIT
}
