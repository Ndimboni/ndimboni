# andasy.hcl app configuration file generated for hoaxchange on Sunday, 23-Nov-25 22:30:46 CAT
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "hoaxchange"

app {

  env = {}

  port = 3000

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "hoaxchange"
  }

}
