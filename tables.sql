CREATE TABLE IF NOT EXISTS `items` (
`id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` double(10,2) NOT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT '1',
  `creatorId` int(11) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) unsigned NOT NULL,
  `sess` varchar(32) NOT NULL,
  `balance` double(10,2) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

ALTER TABLE `items` ADD PRIMARY KEY (`id`), ADD KEY `creatorId` (`creatorId`);
ALTER TABLE `users` ADD PRIMARY KEY (`id`);
ALTER TABLE `items` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `users` MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1;

ALTER TABLE `items` ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`creatorId`) REFERENCES `users` (`id`);