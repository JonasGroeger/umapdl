import {Command, Flags} from '@oclif/core'
import {umap} from '../umap'

export default class Download extends Command {
  static description = 'Downloads a map from uMap using the id of the map. Example: download fr 726257'

  static examples = [
    '<%= config.bin %> <%= command.id %> fr 726257',
  ]

  static args = [
    {name: 'domain'},
    {name: 'mapId'},
  ]

  static flags = {
    resolveRemoteLayers: Flags.boolean({
      char: 'r',
      default: false,
    })
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Download)
    const options = {resolveRemote: flags.resolveRemoteLayers, domain: args.domain}
    umap
      .download(args.mapId, options)
      .then((response: string) => console.log(response))
  }
}
