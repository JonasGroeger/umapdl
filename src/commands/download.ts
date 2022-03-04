import {Command, Flags} from '@oclif/core'
import {umap} from '../umap'

export default class Download extends Command {
  static description = 'Downloads a map from uMap using the id of the map. Example: download 726257'

  static examples = [
    '<%= config.bin %> <%= command.id %> 726257',
  ]

  static args = [
    {name: 'mapId'}
  ]

  static flags = {
    resolveRemoteLayers: Flags.boolean({
      char: 'r',
      default: false,
    })
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Download)
    const options = {resolveRemote: flags.resolveRemoteLayers}
    umap
      .download(args.mapId, options)
      .then((response: string) => console.log(response))
  }
}
