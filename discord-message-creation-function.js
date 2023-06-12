module.exports = async ({
  Discord: Discord,
  message: message,
  channel: channel,
  content: content,
  embeds: embeds,
  files: files,
  timeout = 300000
}) => {
  let currentPage = 1
  const generateButtons = () => {
    const checkState = (name) => {
      if (["first", "previous"].includes(name) && currentPage === 1) return true
      if (["next", "last"].includes(name) && currentPage === embeds.length) return true
      return false
    }
    const button1 = new Discord.ButtonBuilder()
      button1.setEmoji("⬅️")
      button1.setCustomId("first")
      button1.setDisabled(checkState("first"))
      button1.setStyle("Primary")
    const button2 = new Discord.ButtonBuilder()
      button2.setEmoji("◀️")
      button2.setCustomId("previous")
      button2.setDisabled(checkState("previous"))
      button2.setStyle("Primary")
    const button3 = new Discord.ButtonBuilder()
      button3.setEmoji("▶️")
      button3.setCustomId("next")
      button3.setDisabled(checkState("next"))
      button3.setStyle("Primary")
    const button4 = new Discord.ButtonBuilder()
      button4.setEmoji("➡️")
      button4.setCustomId("last")
      button4.setDisabled(checkState("last"))
      button4.setStyle("Primary")
    let buttons = [
      button1,
      button2,
      button3,
      button4
    ]
    if (embeds.length == 2) {
      buttons = [
        button2,
        button3
      ]
    } if (embeds.length == 1) {
      buttons = []
    }

    return buttons
  }
  let getContent = () => {
    initialContent = ""
    if (content) initialContent = content
    return initialContent
  }
  const changeFooter = () => {
    const embed = embeds[currentPage - 1]
    const newEmbed = new Discord.EmbedBuilder(embed)
    if (embed?.data?.footer?.text && embeds.length == 1) {
      return newEmbed.setFooter({
        text: `${embed.data.footer.text}`,
        iconURL: embed.data.footer.icon_url
      })
    } else if (embed?.data?.footer?.text && embeds.length > 1) {
      return newEmbed.setFooter({
        text: `${embed.data.footer.text}  •  Sayfa ${currentPage}/${embeds.length}`,
        iconURL: embed.data.footer.icon_url
      })
    } else if (embeds.length > 1) {
      return newEmbed.setFooter({
        text: `Sayfa ${currentPage}/${embeds.length}`
      })
    } else {
      return newEmbed
    }
  }
  let getFiles = () => {
    initialFiles = []
    if (files) initialFiles = files
    return initialFiles
  }
  let components = () => [
    new Discord.ActionRowBuilder().addComponents(generateButtons())
  ]
  let initialMessage
  if (embeds.length == 1) {
    initialMessage = await channel.send({
      content: getContent(),
      embeds: [
        changeFooter()
      ],
      files: getFiles()
    })
  } else {
    initialMessage = await channel.send({
      content: getContent(),
      embeds: [
        changeFooter()
      ],
      files: getFiles(),
      components: components(),
    })
  }
  const filter = (interaction) => (interaction.user.id === message.author.id) && (interaction.customId === "first" || interaction.customId === "previous" || interaction.customId === "next" || interaction.customId === "last")
  const collector = await initialMessage.createMessageComponentCollector({
    filter,
    time: timeout,
  })
  
  collector.on("collect", async (interaction) => { 
    if (interaction.customId === "first") currentPage = 1
    if (interaction.customId === "previous") currentPage--
    if (interaction.customId === "next") currentPage++
    if (interaction.customId === "last") currentPage = embeds.length
    
    await interaction.deferUpdate()
    if (embeds.length == 1) {
      await interaction.editReply({
        content: getContent(),
        embeds: [
          changeFooter()
        ],
        files: getFiles()
      })
    } else {
      await interaction.editReply({
        content: getContent(),
        embeds: [
          changeFooter()
        ],
        files: getFiles(),
        components: components(),
      })
    }
    collector.resetTimer()
  })

  collector.on("end", () => {
    if (!initialMessage.deleted) {
      if (embeds.length == 1) {
        initialMessage.edit({
          content: getContent(),
          embeds: [
            changeFooter()
          ],
          files: getFiles()
        })
      } else {
        initialMessage.edit({
          content: getContent(),
          embeds: [
            changeFooter()
          ],
          files: getFiles(),
          components: components(),
        })
      }
    }
  })

  return initialMessage
}